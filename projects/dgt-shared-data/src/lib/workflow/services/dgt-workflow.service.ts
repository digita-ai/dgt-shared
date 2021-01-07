import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTWorkflow } from '../models/dgt-workflow.model';

@DGTInjectable()
/**
 * The DGTWorkflowService contains methods for managing DGTWorkflows (CRUD)
 * as well as the execution of workflows
 */
export abstract class DGTWorkflowService implements DGTLDResourceService<DGTWorkflow> {
    public abstract get(id: string): Observable<DGTWorkflow>;
    public abstract query(filter?: DGTLDFilter): Observable<DGTWorkflow[]>;
    public abstract save<T extends DGTWorkflow>(resources: T[]): Observable<T[]>;
    public abstract delete(resource: DGTWorkflow): Observable<DGTWorkflow>;

    public constructor(
        protected logger: DGTLoggerService,
        protected paramChecker: DGTParameterCheckerService,
        protected filters: DGTLDFilterService,
        protected connectors: DGTConnectorService,
    ) { }

    /**
     * Executes workflows for an exchange
     * @param exchange The exchange to execute workflows for
     * @param resources The resources that should be changed by this workflow
     */
    public execute<T extends DGTLDResource>(exchange: DGTExchange, resources: T[]): Observable<T[]> {
        this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange, resources });

        this.paramChecker.checkParametersNotNull({ exchange, resources });

        return of({ exchange, resources })
        .pipe(
            switchMap(data => this.query().pipe(
                map(workflows => ({...data, workflows: workflows.filter(workflow => workflow.source === exchange.source)})),
            )),
            switchMap(data => (data.workflows.length === 0 ? of([data.resources]) : forkJoin(data.workflows.map(workflow => this.executeForWorkflow(workflow, data.exchange, data.resources))))
            .pipe(map(updatedTriples => ({ ...data, updatedTriples: _.flatten(updatedTriples) })))),
            map(data => data.resources),
        );
    }

    /**
     * Executes the actions of a single workflow
     * @param workflow The workflow which contains the actions that should execute
     * @param exchange The exchange to execute workflows for
     * @param resources The resources that should be changed by this workflow
     */
    private executeForWorkflow(workflow: DGTWorkflow, exchange: DGTExchange, resources: DGTLDResource[]): Observable<DGTLDResource[]> {
        this.logger.debug(DGTWorkflowService.name, 'Executing a single workflow', { workflow, exchange, resources });

        this.paramChecker.checkParametersNotNull({ workflow, resources });

        return of({ workflow, resources, exchange })
        .pipe(
            switchMap(data => this.filters.run(workflow.filter, data.resources)
            .pipe(map(triples => ({ ...data, triples })))),
            switchMap(data => forkJoin(workflow.actions.map(action => action.execute(data.triples)))
            .pipe(map(updatedTriples => ({ ...data, updatedTriples: _.flatten(updatedTriples) })))),
            switchMap(data =>
            data.workflow.destination ?
                this.connectors.save(data.exchange, data.updatedTriples, data.workflow.destination).pipe(
                map(newTriple => ({ ...data, newTriple })),
                ) : of(data),
            ),
            map(data => data.triples),
        );
    }
}
