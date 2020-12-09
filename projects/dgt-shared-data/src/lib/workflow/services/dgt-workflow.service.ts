import { DGTWorkflow } from '../models/dgt-workflow.model';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, tap, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDFilterPartial } from '../../linked-data/models/dgt-ld-filter-partial.model';

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

  public execute<T extends DGTLDResource>(exchange: DGTExchange, resources: T[]): Observable<T[]> {
    this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange, resources });

    if (!exchange) {
      throw new DGTErrorArgument('Argument exchange should be set.', exchange);
    }

    if (!resources) {
      throw new DGTErrorArgument('Argument resources should be set.', resources);
    }

    return of({ exchange, resources, workflows: this.workflows.filter(workflow => workflow.source === exchange.source) })
      .pipe(
        switchMap(data => (data.workflows.length === 0 ? of([data.resources]) : forkJoin(data.workflows.map(workflow => this.executeForWorkflow(workflow, data.exchange, data.resources))))
          .pipe(map(updatedResources => ({ ...data, updatedResources: _.flatten(updatedResources) })))),
        map(data => data.resources),
      );
  }

  private executeForWorkflow<T extends DGTLDResource>(workflow: DGTWorkflow, exchange: DGTExchange, resources: T[]): Observable<T[]> {
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

    return of({ workflow, resources, exchange })
      .pipe(
        switchMap(data => this.filters.run<T>(workflow.filter, data.resources)
          .pipe(map(resources => ({ ...data, resources })))),
        switchMap(data => forkJoin(workflow.actions.map(action => action.execute(data.resources)))
          .pipe(map((updatedResources: T[][]) => ({ ...data, updatedResources: _.flatten(updatedResources) })))),
        mergeMap(data => data.workflow.destination ? this.executeForDestination<T>(data.workflow, data.exchange, data.updatedResources) : of(data.resources)),
      );
  }

  private executeForDestination<T extends DGTLDResource>(workflow: DGTWorkflow, exchange: DGTExchange, resources: T[]): Observable<T[]> {
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

    return of({ workflow, exchange, resources })
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
        switchMap(data => this.connectors.save<T>(data.exchange, data.resources)),
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
