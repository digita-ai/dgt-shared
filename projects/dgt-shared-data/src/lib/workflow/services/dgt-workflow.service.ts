import { DGTWorkflow } from '../models/dgt-workflow.model';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, tap, catchError, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService, DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDFilterPartial } from '@digita-ai/dgt-shared-data/lib/linked-data/models/dgt-ld-filter-partial.model';

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

    this.paramChecker.checkParametersNotNull({ exchange, resources });

    return of({ exchange, resources, workflows: this.workflows.filter(workflow => workflow.source === exchange.source) })
      .pipe(
        switchMap(data => (data.workflows.length === 0 ? of([data.resources]) : forkJoin(data.workflows.map(workflow => this.executeForWorkflow(workflow, data.exchange, data.resources))))
          .pipe(map(updatedTriples => ({ ...data, updatedTriples: _.flatten(updatedTriples) })))),
        map(data => data.resources),
      );
  }

  private executeForWorkflow(workflow: DGTWorkflow, exchange: DGTExchange, resources: DGTLDResource[]): Observable<DGTLDResource[]> {
    this.logger.debug(DGTWorkflowService.name, 'Executing a single workflow', { workflow, exchange, resources });

    this.paramChecker.checkParametersNotNull({ workflow, resources });

    return of({ workflow, resources, exchange })
      .pipe(
        switchMap(data => this.filters.run(workflow.filter, data.resources)
          .pipe(map(triples => ({ ...data, triples })))),
        switchMap(data => forkJoin(workflow.actions.map(action => action.execute(data.triples)))
          .pipe(map(updatedTriples => ({ ...data, updatedTriples: _.flatten(updatedTriples) })))),
        mergeMap(data => data.workflow.destination ? this.exchanges.query({
          type: DGTLDFilterType.PARTIAL,
          partial: {
            source: data.workflow.destination,
            holder: exchange.holder,
            purpose: exchange.purpose,
          }
        } as DGTLDFilterPartial).pipe(
          tap( exchangesRes => {
            if ( !exchangesRes[0]) {
              this.logger.debug(DGTWorkflowService.name, 'No exchange found for this upstreamsync', { exchange, exchangesRes });
              throw new DGTErrorArgument('No exchange found for this upstreamsync', null);
            }
          }),
          map(exchangesRes => ({ ...data, exchange: exchangesRes[0], updatedTriples: data.updatedTriples.map( tr => ({ ...tr, exchange: exchangesRes[0].uri }) )})),
          switchMap( data2 => this.connectors.save(data2.exchange, data2.updatedTriples).pipe( map( () => data) )),
          catchError( error => of(data)),
        ) : of(data)),
        map(data => data.triples),
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
