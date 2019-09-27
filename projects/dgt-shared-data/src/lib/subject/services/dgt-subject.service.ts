import { Observable, forkJoin, of } from 'rxjs';
import { DGTSubject } from '../models/dgt-subject.model';
import { switchMap, map } from 'rxjs/operators';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { DGTExchange } from '../models/dgt-subject-exchange.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';
import * as _ from 'lodash';
import { DGTLDMapping } from '../../linked-data/models/dgt-ld-mapping.model';
import { DGTDataService } from '../../metadata/services/dgt-data.service';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTSubjectService {
    constructor(private data: DGTDataService, private sources: DGTSourceService) { }

    public getValuesForSubject(subject: DGTSubject): Observable<DGTLDValue[]> {
        return of({ subject })
            .pipe(
                switchMap(data => this.data.getEntities<DGTExchange>('exchange', { conditions: [{ field: 'subject', operator: '==', value: subject.id }] })
                    .pipe(map(exchanges => ({ exchanges, ...data })))),
                switchMap(data => forkJoin(data.exchanges.map(exchange => this.getValuesForExchange(exchange)))
                    .pipe(map(valuesPerExchange => ({ valuesPerExchange, ...data })))),
                map(data => _.flatten(data.valuesPerExchange)),
            );
    }

    public getValuesForExchange(exchange: DGTExchange): Observable<DGTLDValue[]> {
        return of({ exchange })
            .pipe(
                switchMap((data) => this.data.getEntities<DGTSource>('source', {
                    conditions: [
                        {
                            field: 'subject',
                            operator: '==',
                            value: exchange.subject,
                        },
                    ],
                }).pipe(map(sources => ({ sources, ...data })))),
                switchMap((data) => this.data.getEntity<DGTJustification>('justification', exchange.justification)
                    .pipe(map(justification => ({ justification, ...data })))),
                switchMap((data) => this.data.getEntities<DGTLDMapping>('mapping', { conditions: [] })
                    .pipe(map(mappings => ({ mappings, ...data })))),
                switchMap((data) => forkJoin(data.sources.map((source => this.sources.get(exchange, source, data.justification, data.mappings))))),
                map(results => {
                    let res: DGTLDValue[] = [];

                    if (results) {
                        results.forEach((result) => res = [...res, ...result]);
                    }

                    return res;
                }),
            );
    }
}
