import { DGTWorkflow } from '../models/dgt-workflow.model';
import { DGTLDField } from '../../linked-data/models/dgt-ld-field.model';
import { Observable, of, forkJoin } from 'rxjs';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { DGTLDMapping } from '../../linked-data/models/dgt-ld-mapping.model';
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

    public execute(exchange: DGTExchange, mappings: DGTLDMapping[])
        : Observable<DGTLDValue[]> {
        this.logger.debug(DGTWorkflowService.name, 'Executing workflow', { exchange, mappings });

        return of({ exchange, mappings })
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
                    data.sources.map((source => this.sources.get(exchange, source, data.justification, data.mappings)))
                )
                    .pipe(map(valuesPerSource => ({ valuesPerSource, ...data })))),
                map(data => _.flatten(data.valuesPerSource)),
            );
    }


    public get(field: DGTLDField): DGTWorkflow[] {
        this.logger.debug(DGTWorkflowService.name, 'Getting workflow for field', { field });

        let res: DGTWorkflow[] = null;

        if (field && this.workflows && this.workflows.length > 0) {
            res = this.workflows.filter(workflow =>
                workflow && workflow.trigger && workflow.trigger.field
                && workflow.trigger.field.namespace === field.namespace
                && workflow.trigger.field.name === field.name);
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
