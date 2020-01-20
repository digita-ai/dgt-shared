import { DGTWorkflow } from '../models/dgt-workflow.model';
import { DGTLDField } from '../../linked-data/models/dgt-ld-field.model';
import { Observable, of, forkJoin } from 'rxjs';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { switchMap, map } from 'rxjs/operators';
import { DGTDataService } from '../../metadata/services/dgt-data.service';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { DGTLoggerService } from '@digita/dgt-shared-utils';

@Injectable()
export class DGTWorkflowService {

    private workflows: DGTWorkflow[];

    constructor(private logger: DGTLoggerService, private data: DGTDataService, private sources: DGTSourceService) { }

    public execute(exchange: DGTExchange)
        : Observable<DGTLDValue[]> {
        this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange });

        return of({ exchange })
            .pipe(
                switchMap((data) => this.data.getEntity<DGTJustification>('justification', exchange.justification)
                    .pipe(map(justification => ({ justification, ...data })))),
                switchMap((data) => this.data.getEntities<DGTSource>('source', {
                    conditions: [
                        {
                            field: 'subject',
                            operator: '==',
                            value: exchange.subject,
                        },
                    ],
                })
                    .pipe(map(sources => ({ sources, ...data })))),
                switchMap((data) => forkJoin(
                    data.sources.map((source => this.sources.get(exchange, source, data.justification)))
                )
                    .pipe(map(valuesPerSource => ({ valuesPerSource, ...data })))),
                map(data => {
                    const values: DGTLDValue[] = _.flatten(data.valuesPerSource);

                    this.logger.debug(DGTWorkflowService.name, 'Retrieved values from sources, running workflows',
                        { exchange, values });

                    values.map((value) => {
                        if (value) {
                            const workflows = this.get(value.field);

                            if (workflows) {
                                workflows.forEach((workflow) => {
                                    if (workflow && workflow.actions) {
                                        workflow.actions.forEach((action) => {
                                            if (action) {
                                                value = action.execute(value);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });

                    return values;
                }),
            );
    }


    public get(field: DGTLDField): DGTWorkflow[] {
        this.logger.debug(DGTWorkflowService.name, 'Getting workflow for field', { field });

        let res: DGTWorkflow[] = null;

        if (field && this.workflows && this.workflows.length > 0) {
            res = this.workflows.filter(workflow =>
                workflow
                && workflow.trigger
                && workflow.trigger.fields
                && workflow.trigger.fields.filter((f) => f.namespace === field.namespace && f.name === field.name).length > 0);
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
