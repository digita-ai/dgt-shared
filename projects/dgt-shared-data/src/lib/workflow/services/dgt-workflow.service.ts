import { DGTWorkflow } from '../models/dgt-workflow.model';
import { Observable, of, forkJoin } from 'rxjs';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';

@DGTInjectable()
export class DGTWorkflowService {

  private workflows: DGTWorkflow[] = [];

  constructor(
    private logger: DGTLoggerService,
    private filters: DGTLDFilterService,
    private connectors: DGTConnectorService,
  ) { }

  public execute(exchange: DGTExchange, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange, triples });

    if (!exchange) {
      throw new DGTErrorArgument('Argument exchange should be set.', exchange);
    }

    if (!triples) {
      throw new DGTErrorArgument('Argument triples should be set.', triples);
    }

    return of({ exchange, triples, workflows: this.workflows.filter(workflow => workflow.source === exchange.source) }).pipe(
      switchMap(data => (data.workflows.length === 0 ? of([data.triples]) : forkJoin(data.workflows.map(workflow => this.executeForWorkflow(workflow, data.exchange, data.triples))))
        .pipe(map(updatedTriples => ({ ...data, updatedTriples: _.flatten(updatedTriples) })))),
      map(data => data.triples),
    );
  }

  private executeForWorkflow(workflow: DGTWorkflow, exchange: DGTExchange, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    this.logger.debug(DGTWorkflowService.name, 'Executing a single workflow', { workflow, exchange, triples });

    if (!workflow) {
      throw new DGTErrorArgument('Argument workflow should be set.', workflow);
    }

    if (!triples) {
      throw new DGTErrorArgument('Argument triples should be set.', triples);
    }

    return of({ workflow, triples, exchange })
      .pipe(
        switchMap(data => this.filters.run(workflow.filter, data.triples)
          .pipe(map(triples => ({ ...data, triples })))),
        switchMap(data => forkJoin(workflow.actions.map(action => action.execute(data.triples)))
          .pipe(map(updatedTriples => ({ ...data, updatedTriples })))),
        switchMap(data => data.workflow.destination ? this.connectors.save(data.exchange, data.triples).pipe(map(newTriple => ({ ...data, newTriple }))) : of(data)),
        map(data => data.triples),
      );
  }

  public register(workflow: DGTWorkflow) {
    this.logger.debug(DGTWorkflowService.name, 'Registring workflow', { workflow });

    if (!workflow) {
      throw new DGTErrorArgument('Argument workflow should be set.', workflow);
    }

    if (!this.workflows) {
      this.workflows = [];
    }

    this.workflows.push(workflow);
  }

}
