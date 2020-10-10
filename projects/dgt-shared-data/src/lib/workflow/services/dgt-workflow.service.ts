import { DGTWorkflow } from '../models/dgt-workflow.model';
import { Observable, of, forkJoin, concat } from 'rxjs';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { last, map, mergeMap, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';

@DGTInjectable()
export class DGTWorkflowService {

  private workflows: DGTWorkflow[];

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

    return of({ exchange, triples }).pipe(
      switchMap(data => forkJoin(data.triples.map(triple => this.executeForTriple(exchange, triple)))),
    );
  }

  private executeForTriple(exchange: DGTExchange, triple: DGTLDTriple): Observable<DGTLDTriple> {
    this.logger.debug(DGTWorkflowService.name, 'Executing an exchange for triple', { exchange, triple });

    if (!exchange) {
      throw new DGTErrorArgument('Argument exchange should be set.', exchange);
    }

    if (!triple) {
      throw new DGTErrorArgument('Argument triple should be set.', triple);
    }

    return of({ exchange, triple })
      .pipe(
        switchMap(data => this.get(exchange.source, triple)
          .pipe(map(workflows => ({ ...data, workflows })))),
        switchMap(data => (data.workflows && data.workflows.length > 0 ? concat(data.workflows.map(workflow => this.executeForWorkflow(workflow, data.exchange, data.triple))) : of(of(triple)))
          .pipe(last(), switchMap(a => a), map(a => ({ ...data, triple: a })))),
        map(data => data.triple),
      );
  }

  private executeForWorkflow(workflow: DGTWorkflow, exchange: DGTExchange, triple: DGTLDTriple): Observable<DGTLDTriple> {
    this.logger.debug(DGTWorkflowService.name, 'Executing a single workflow for triple', { workflow, exchange, triple });

    if (!workflow) {
      throw new DGTErrorArgument('Argument workflow should be set.', workflow);
    }

    if (!triple) {
      throw new
        DGTErrorArgument('Argument triple should be set.', triple);
    }

    return of({ workflow, triple, exchange })
      .pipe(
        map(data => {
          let res = data.triple;

          workflow.actions.forEach(action =>
            action.execute(res).pipe(
              map(actionRes => res = actionRes)
            )
          );

          return ({ ...data, res })
        }),
        switchMap(data => data.workflow.destination ? this.connectors.save(data.exchange, data.triple).pipe(map(newTriple => ({ ...data, newTriple }))) : of(data)),
        map(data => data.triple),
      );
  }

  public get(source: string, triple: DGTLDTriple): Observable<DGTWorkflow[]> {
    this.logger.debug(DGTWorkflowService.name, 'Getting workflow for triple', { triple });

    if (!source) {
      throw new DGTErrorArgument('Argument source should be set.', source);
    }

    if (!triple) {
      throw new DGTErrorArgument('Argument triple should be set.', triple);
    }

    const allWorkflows = this.workflows.filter(workflow => workflow && workflow.source === source);

    return of({ triple, allWorkflows }).pipe(
      mergeMap(data => forkJoin(
        data.allWorkflows.map(workflow =>
          this.filters.run(workflow.filter, [data.triple]).pipe(
            map(triples => ({ workflow, triples })),
          )
        )
      ).pipe(map(triplesPerWorkflow => ({ ...data, triplesPerWorkflow })))),
      map(data => ({ ...data, workflowsToExecute: data.triplesPerWorkflow.filter(w => w.triples.length > 0).map(w => w.workflow) })),
      map(data => data.workflowsToExecute)
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
