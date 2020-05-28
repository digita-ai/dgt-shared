import { Observable, forkJoin, of, concat, zip, merge } from 'rxjs';
import { DGTSubject } from '../models/dgt-subject.model';
import { switchMap, map, tap, concatAll, filter, mergeMap } from 'rxjs/operators';
import { DGTExchange } from '../models/dgt-subject-exchange.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import * as _ from 'lodash';
import { DGTDataService } from '../../metadata/services/dgt-data.service';
import { Injectable } from '@angular/core';
import { DGTWorkflowService } from '../../workflow/services/dgt-workflow.service';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTConnection } from '../../connection/models/dgt-connection.model';

@Injectable()
export class DGTSubjectService {
    constructor(
        private logger: DGTLoggerService,
        private data: DGTDataService,
        private cache: DGTCacheService,
        private workflow: DGTWorkflowService
    ) { }

    public getValuesForSubject(subject: DGTSubject): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTSubjectService.name, 'Getting subject values', { subject });

        return this.data.getEntities<DGTExchange>('exchange', { conditions: [{ field: 'subject', operator: '==', value: subject.id }] })
            .pipe(
                filter(exchanges => exchanges && exchanges.length > 0),
                tap(exchanges => this.logger.debug(DGTSubjectService.name, 'Retrieved exchanges for subject', {exchanges, subject})),
                mergeMap(exchanges => forkJoin(exchanges.map(exc => this.getValuesForExchange(exc)))),
                map(val => _.flatten(val))
            );
    }

    public getValuesForExchange(exchange: DGTExchange): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTSubjectService.name, 'Getting exchange values', { exchange });

        return of({ exchange })
            .pipe(
                switchMap(data => this.cache.getValuesForExchange(exchange)
                    .pipe(map(values => ({ values, ...data })))),
                switchMap(data => this.data.getEntity<DGTConnection<any>>('connection', exchange.connection)
                    .pipe(map(connection => ({ ...data, connection })))),
                switchMap(data => {
                    let res = of(data.values);

                    if (!data.values || data.values.length === 0) {
                        res = this.workflow.execute(exchange, data.connection)
                            .pipe(
                                switchMap((values) => this.cache.storeForExchange(exchange, values)),
                            );
                    }

                    return res;
                }),
            );
    }
}
