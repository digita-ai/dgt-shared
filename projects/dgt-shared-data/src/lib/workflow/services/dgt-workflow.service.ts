import { DGTWorkflow } from '../models/dgt-workflow.model';
import { Observable, of, forkJoin } from 'rxjs';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { map, mergeMap, mergeAll } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
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

  public executeHelper(exchange: DGTExchange, triple: DGTLDTriple): Observable<DGTLDTriple> {
    return this.get(exchange.source, triple).pipe(
      map(flows => {
        let res = triple;
        flows.forEach(workflow => {
          workflow.actions.forEach(action =>
            action.execute(res).pipe(
              map(actionRes => res = actionRes)
            )
          );
          if (workflow.destination) {
            this.connectors.save(exchange, res);
          }
        });
        return res;
      }),
    );
  }

  public execute(exchange: DGTExchange, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange, triples });
    return of({ exchange, triples }).pipe(
      map(data => forkJoin(data.triples.map(triple => {
        return this.executeHelper(exchange, triple);
      }))),
      mergeAll(),
    );
  }


  public get(source: string, triple: DGTLDTriple): Observable<DGTWorkflow[]> {
    this.logger.debug(DGTWorkflowService.name, 'Getting workflow for triple', { triple });

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

    if (!this.workflows) {
      this.workflows = [];
    }

    this.workflows.push(workflow);
  }

}
