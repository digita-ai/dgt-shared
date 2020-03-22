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
import { DGTConnection } from '../../connection/models/dgt-connection.model';

@Injectable()
export class DGTWorkflowService {

    private workflows: DGTWorkflow[];

    constructor(private logger: DGTLoggerService, private data: DGTDataService, private sources: DGTSourceService) { }

    public execute(exchange: DGTExchange, connection: DGTConnection<any>)
        : Observable<DGTLDValue[]> {
        this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange });

        return of({ exchange })
            .pipe(
                switchMap((data) => this.data.getEntity<DGTJustification>('justification', exchange.justification)
                    .pipe(map(justification => ({ justification, ...data })))),
                switchMap((data) => this.data.getEntity<DGTSource<any>>('source', exchange.source)
                    .pipe(map(source => ({ source, ...data })))),
                switchMap((data) => this.sources.get(exchange, connection, data.source, data.justification)
                    .pipe(map(valuesPerSource => ({ valuesPerSource, ...data })))),
                map(data => {
                    const values: DGTLDValue[] = _.flatten(data.valuesPerSource);

                    this.logger.debug(DGTWorkflowService.name, 'Retrieved values from sources, running workflows',
                        { exchange, values });

                    values.map((value) => {
                        if (value) {
                            const workflows = this.get(exchange.source, value.field);

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


    public get(source: string, field: DGTLDField): DGTWorkflow[] {
        this.logger.debug(DGTWorkflowService.name, 'Getting workflow for field', { field });

        let res: DGTWorkflow[] = null;

        if (field && this.workflows && this.workflows.length > 0) {
            res = this.workflows.filter(workflow =>
                workflow
                && workflow.source === source
                && workflow.fields
                && workflow.fields.filter((f) => f.namespace === field.namespace && f.name === field.name).length > 0);
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
