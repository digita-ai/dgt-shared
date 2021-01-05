import { DGTLDTransformer } from '@digita-ai/dgt-shared-data/public-api';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDFilterPartial } from '../../linked-data/models/dgt-ld-filter-partial.model';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTWorkflow } from '../models/dgt-workflow.model';

@DGTInjectable()
export class DGTWorkflowService {

  private workflows: DGTWorkflow[] = [];

  constructor(
    private logger: DGTLoggerService,
    private filters: DGTLDFilterService,
    private connectors: DGTConnectorService,
    private paramChecker: DGTParameterCheckerService,
    private exchanges: DGTExchangeService,
  ) { }

  public execute<T extends DGTLDResource>(exchange: DGTExchange, resources: T[], transformer: DGTLDTransformer<T>): Observable<T[]> {
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

    return of({ transformer, exchange, resources, workflows: this.workflows.filter(workflow => workflow.source === exchange.source) })
      .pipe(
        switchMap(data => (data.workflows.length === 0 ? of([data.resources]) : forkJoin(data.workflows.map(workflow => this.executeForWorkflow(workflow, data.exchange, data.resources, data.transformer))))
          .pipe(map(updatedResources => ({ ...data, updatedResources: _.flatten(updatedResources) })))),
        map(data => data.resources),
      );
  }

  private executeForWorkflow<T extends DGTLDResource>(workflow: DGTWorkflow, exchange: DGTExchange, resources: T[], transformer: DGTLDTransformer<T>): Observable<T[]> {
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

    return of({ workflow, resources, exchange, transformer })
      .pipe(
        switchMap(data => this.filters.run<T>(workflow.filter, data.resources)
          .pipe(map(filteredResources => ({ ...data, resources: filteredResources })))),
        switchMap(data => forkJoin(workflow.actions.map(action => action.execute(data.resources)))
          .pipe(map((updatedResources: T[][]) => ({ ...data, updatedResources: _.flatten(updatedResources) })))),
        mergeMap(data => data.workflow.destination ? this.executeForDestination<T>(data.workflow, data.exchange, data.updatedResources, transformer) : of(data.resources)),
      );
  }

  private executeForDestination<T extends DGTLDResource>(workflow: DGTWorkflow, exchange: DGTExchange, resources: T[], transformer: DGTLDTransformer<T>): Observable<T[]> {
    this.logger.debug(DGTWorkflowService.name, 'Executing a workflow for a destination', { workflow, exchange, resources });

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

    return of({ workflow, exchange, resources, transformer })
      .pipe(
        switchMap(data => this.exchanges.query({
          type: DGTLDFilterType.PARTIAL,
          partial: {
            source: data.workflow.destination,
            holder: exchange.holder,
            purpose: exchange.purpose,
          }
        } as DGTLDFilterPartial)
          .pipe(map(exchanges => ({ ...data, exchanges })))),
        tap(data => this.logger.debug(DGTWorkflowService.name, 'Retrieved exchanges', data)),
        // map(exchanges => ({ ...data, exchange: exchanges[0], updatedResources: data.updatedResources.map(tr => ({ ...tr, exchange: exchanges[0].uri })) })),
        switchMap(data => this.connectors.save<T>(data.exchange, data.resources, data.transformer)),
      );
  }

  public register(workflow: DGTWorkflow) {
    this.logger.debug(DGTWorkflowService.name, 'Registring workflow', { workflow });

    this.paramChecker.checkParametersNotNull({ workflow });

    if (!this.workflows) {
      this.workflows = [];
    }

    this.workflows.push(workflow);
  }

}
