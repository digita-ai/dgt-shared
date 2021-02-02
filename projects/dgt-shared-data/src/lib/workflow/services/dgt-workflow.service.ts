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
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
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
                    .pipe(map((exchangesForDestination) => ({ ...data, exchangesForDestination }))),
            ),
            tap((data) => this.logger.info(DGTWorkflowService.name, 'Retrieved exchanges', data)),
            switchMap((data) =>
                data.exchangesForDestination && data.exchangesForDestination.length > 0
                    ? forkJoin(
                          data.exchangesForDestination.map((exchangeForDestination) =>
                              this.connectors.save<T>(
                                  exchangeForDestination,
                                  data.resources.map((resourceToWrite) => ({
                                      ...resourceToWrite,
                                      exchange: exchangeForDestination.uri,
                                  })),
                                  data.transformer,
                              ),
                          ),
                      ).pipe(map((savedResources) => _.flatten(savedResources)))
                    : of(data.resources),
            ),
            tap((data) => this.logger.info(DGTWorkflowService.name, 'Saved resources to destination', data)),
        );
    }
}
