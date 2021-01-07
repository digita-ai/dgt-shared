import { DGTLDTransformer } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDFilterPartial } from '../../linked-data/models/dgt-ld-filter-partial.model';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
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

    constructor(
        protected logger: DGTLoggerService,
        protected filters: DGTLDFilterService,
        protected connectors: DGTConnectorService,
        protected exchanges: DGTExchangeService,
    ) {}

    public execute<T extends DGTLDResource>(
        exchange: DGTExchange,
        resources: T[],
        transformer: DGTLDTransformer<T>,
    ): Observable<T[]> {
        this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange, resources });

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ transformer, exchange, resources }).pipe(
            switchMap((data) =>
                this.query().pipe(
                    map((workflows) => ({
                        ...data,
                        workflows: workflows.filter((workflow) => workflow.source === exchange.source),
                    })),
                ),
            ),
            switchMap((data) =>
                (data.workflows.length === 0
                    ? of([data.resources])
                    : forkJoin(
                          data.workflows.map((workflow) =>
                              this.executeForWorkflow(workflow, data.exchange, data.resources, data.transformer),
                          ),
                      )
                ).pipe(map((updatedResources) => ({ ...data, updatedResources: _.flatten(updatedResources) }))),
            ),
            map((data) => data.resources),
        );
    }

    private executeForWorkflow<T extends DGTLDResource>(
        workflow: DGTWorkflow,
        exchange: DGTExchange,
        resources: T[],
        transformer: DGTLDTransformer<T>,
    ): Observable<T[]> {
        this.logger.debug(DGTWorkflowService.name, 'Executing a single workflow', { workflow, exchange, resources });

        if (!workflow) {
            throw new DGTErrorArgument('Argument workflow should be set.', workflow);
        }

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ workflow, resources, exchange, transformer }).pipe(
            // switchMap((data) =>
            //     this.filters
            //         .run<T>(workflow.filter, data.resources)
            //         .pipe(map((filteredResources) => ({ ...data, resources: filteredResources }))),
            // ),
            switchMap((data) =>
                (workflow.actions.length > 0
                    ? forkJoin(workflow.actions.map((action) => action.execute(data.resources)))
                    : of([[...data.resources]])
                ).pipe(map((updatedResources: T[][]) => ({ ...data, updatedResources: _.flatten(updatedResources) }))),
            ),
            mergeMap((data) =>
                data.workflow.destination
                    ? this.executeForDestination<T>(data.workflow, data.exchange, data.updatedResources, transformer)
                    : of(data.resources),
            ),
        );
    }

    private executeForDestination<T extends DGTLDResource>(
        workflow: DGTWorkflow,
        exchange: DGTExchange,
        resources: T[],
        transformer: DGTLDTransformer<T>,
    ): Observable<T[]> {
        this.logger.debug(DGTWorkflowService.name, 'Executing a workflow for a destination', {
            workflow,
            exchange,
            resources,
        });

        if (!workflow) {
            throw new DGTErrorArgument('Argument workflow should be set.', workflow);
        }

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ workflow, exchange, resources, transformer }).pipe(
            switchMap((data) =>
                this.exchanges
                    .query({
                        type: DGTLDFilterType.PARTIAL,
                        partial: {
                            source: data.workflow.destination,
                            holder: exchange.holder,
                            purpose: exchange.purpose,
                        },
                    } as DGTLDFilterPartial)
                    .pipe(map((exchanges) => ({ ...data, exchanges }))),
            ),
            tap((data) => this.logger.debug(DGTWorkflowService.name, 'Retrieved exchanges', data)),
            // map(exchanges => ({ ...data, exchange: exchanges[0], updatedResources: data.updatedResources.map(tr => ({ ...tr, exchange: exchanges[0].uri })) })),
            switchMap((data) => this.connectors.save<T>(data.exchange, data.resources, data.transformer)),
        );
    }
    // /**
    //  * Executes workflows for an exchange
    //  * @param exchange The exchange to execute workflows for
    //  * @param resources The resources that should be changed by this workflow
    //  */
    // public execute<T extends DGTLDResource>(exchange: DGTExchange, resources: T[]): Observable<T[]> {
    //     this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange, resources });

    //     this.paramChecker.checkParametersNotNull({ exchange, resources });

    //     return of({ exchange, resources })
    //     .pipe(
    //         switchMap(data => this.query().pipe(
    //             map(workflows => ({...data, workflows: workflows.filter(workflow => workflow.source === exchange.source)})),
    //         )),
    //         switchMap(data => (data.workflows.length === 0 ? of([data.resources]) : forkJoin(data.workflows.map(workflow => this.executeForWorkflow(workflow, data.exchange, data.resources))))
    //         .pipe(map(updatedTriples => ({ ...data, updatedTriples: _.flatten(updatedTriples) })))),
    //         map(data => data.resources),
    //     );
    // }

    // /**
    //  * Executes the actions of a single workflow
    //  * @param workflow The workflow which contains the actions that should execute
    //  * @param exchange The exchange to execute workflows for
    //  * @param resources The resources that should be changed by this workflow
    //  */
    // private executeForWorkflow(workflow: DGTWorkflow, exchange: DGTExchange, resources: DGTLDResource[]): Observable<DGTLDResource[]> {
    //     this.logger.debug(DGTWorkflowService.name, 'Executing a single workflow', { workflow, exchange, resources });

    //     this.paramChecker.checkParametersNotNull({ workflow, resources });

    //     return of({ workflow, resources, exchange })
    //     .pipe(
    //         switchMap(data => this.filters.run(workflow.filter, data.resources)
    //         .pipe(map(triples => ({ ...data, triples })))),
    //         switchMap(data => forkJoin(workflow.actions.map(action => action.execute(data.triples)))
    //         .pipe(map(updatedTriples => ({ ...data, updatedTriples: _.flatten(updatedTriples) })))),
    //         switchMap(data =>
    //         data.workflow.destination ?
    //             this.connectors.save(data.exchange, data.updatedTriples, data.workflow.destination).pipe(
    //             map(newTriple => ({ ...data, newTriple })),
    //             ) : of(data),
    //         ),
    //         map(data => data.triples),
    //     );
    // }
}
