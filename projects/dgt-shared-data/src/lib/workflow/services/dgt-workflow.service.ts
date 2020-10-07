import { DGTWorkflow } from '../models/dgt-workflow.model';
import { Observable, of } from 'rxjs';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';

@DGTInjectable()
export class DGTWorkflowService {

    private workflows: DGTWorkflow[];

    constructor(private logger: DGTLoggerService) { }

    public execute(exchange: DGTExchange, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange, triples });

        return of({ exchange, triples }).pipe(
            map(data => {
                this.logger.debug(DGTWorkflowService.name, 'Retrieved values from sources, running workflows', { exchanges: data.exchange, triples: data.triples });

                // todo clean this up
                data.triples.map((triple) => {

                    if (triple) {
                        const workflows = this.get(exchange.source, triple.predicate);

                        if (workflows) {
                            workflows.forEach((workflow) => {
                                if (workflow && workflow.actions) {
                                    workflow.actions.forEach((action) => {
                                        if (action) {
                                            triple = action.execute(triple);
                                        }
                                    });
                                }
                            });
                        }
                    }
                });

                return data.triples;
            }),
        );
    }


    public get(source: string, field: string): DGTWorkflow[] {
        this.logger.debug(DGTWorkflowService.name, 'Getting workflow for field', { field });

        let res: DGTWorkflow[] = null;

        if (field && this.workflows && this.workflows.length > 0) {
            res = this.workflows.filter(workflow =>
                workflow
                && workflow.source === source
                && workflow.predicates
                && workflow.predicates.filter((f) => f === field).length > 0);
        }

        return res;
    }

    public register(workflow: DGTWorkflow) {
        this.logger.debug(DGTWorkflowService.name, 'Registring workflow', { workflow });

        if (!this.workflows) {
            this.workflows = [];
        }

        this.workflows.push(workflow);
    }

}
