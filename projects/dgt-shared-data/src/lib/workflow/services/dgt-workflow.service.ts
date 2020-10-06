import { DGTWorkflow } from '../models/dgt-workflow.model';
import { Observable, of, forkJoin } from 'rxjs';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { map, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';

@Injectable()
export class DGTWorkflowService {

  private workflows: DGTWorkflow[];

  constructor(
    private logger: DGTLoggerService,
    private filters: DGTLDFilterService,
    private connectors: DGTConnectorService,
  ) { }

  public execute(exchange: DGTExchange, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange, triples });
    return of({ exchange, triples }).pipe(
      mergeMap(data => {
        this.logger.debug(DGTWorkflowService.name, 'Retrieved values from sources, running workflows', { exchanges: data.exchange, triples: data.triples });
        return forkJoin(data.triples.map( (triple: DGTLDTriple) => {
          return this.get(data.exchange.source, triple).pipe(
            mergeMap( (flows: DGTWorkflow[]) => {
              flows.forEach( flow => {
                  if (flow.destination) {
                    this.connectors.save(exchange, triple);
                  }
                  return flow.actions.forEach(action => triple = action.execute(triple));
                });
              return of(triple);
            }),
            );
        }));
      }),
    );
  }


  public get(source: string, triple: DGTLDTriple): Observable<DGTWorkflow[]> {
    this.logger.debug(DGTWorkflowService.name, 'Getting workflow for triple', { triple });

    const res: DGTWorkflow[] = [];

    if (triple && this.workflows && this.workflows.length > 0) {
      // filter on sourceId
      const tempFlows = this.workflows.filter(workflow => workflow && workflow.source === source);
      // filter on workflow.filter
      return of({ triple, tempFlows }).pipe(
        mergeMap( data => forkJoin(data.tempFlows.filter( flow => {
          return this.filters.run(flow.filter, [data.triple]).pipe(
            map( filtered => filtered.length !== 0 ),
          );
        }))),
      );
    }
    return of(res);
  }

  public register(workflow: DGTWorkflow) {
    this.logger.debug(DGTWorkflowService.name, 'Registring workflow', { workflow });

    if (!this.workflows) {
      this.workflows = [];
    }

    this.workflows.push(workflow);
  }

}
