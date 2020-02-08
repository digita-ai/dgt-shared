import { Observable, forkJoin, of, concat, zip, merge } from 'rxjs';
import { DGTSubject } from '../models/dgt-subject.model';
import { switchMap, map, tap, concatAll } from 'rxjs/operators';
import { DGTExchange } from '../models/dgt-subject-exchange.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';
import * as _ from 'lodash';
import { DGTDataService } from '../../metadata/services/dgt-data.service';
import { Injectable } from '@angular/core';
import { DGTWorkflowService } from '../../workflow/services/dgt-workflow.service';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTProvider } from '../../provider/models/dgt-provider.model';

@Injectable()
export class DGTSubjectService {
    constructor(
        private logger: DGTLoggerService,
        private data: DGTDataService,
        private cache: DGTCacheService,
        private workflow: DGTWorkflowService
    ) { }

    public getValuesForSubject(subject: DGTSubject, provider: DGTProvider<any>): Observable<DGTLDValue[]> {
        this.logger.debug(DGTSubjectService.name, 'Getting subject values', { subject });

        return of({ subject })
            .pipe(
                switchMap(data => this.data.getEntities<DGTExchange>('exchange',
                    { conditions: [{ field: 'subject', operator: '==', value: subject.id }] }
                )
                    .pipe(map(exchanges => ({ exchanges, ...data })))),
                switchMap(data => forkJoin(data.exchanges.map(exchange => this.getValuesForExchange(exchange, provider)))
                    .pipe(map(valuesPerExchange => ({ valuesPerExchange, ...data })))),
                map(data => _.flatten(data.valuesPerExchange)),
                // switchMap(data => data.valuesPerExchange),
                tap(data => this.logger.debug(DGTSubjectService.name, 'Retrieved values for subject', data)),
            );
    }

    public getValuesForExchange(exchange: DGTExchange, provider: DGTProvider<any>): Observable<DGTLDValue[]> {
        this.logger.debug(DGTSubjectService.name, 'Getting exchange values', { exchange });

        return of({ exchange })
            .pipe(
                switchMap(data => this.cache.getValuesForExchange(exchange)
                    .pipe(map(values => ({ values, ...data })))),
                switchMap(data => {
                    let res = of(data.values);

                    if (!data.values || data.values.length === 0) {
                        res = this.workflow.execute(exchange, provider)
                            .pipe(
                                switchMap((values) => this.cache.storeForExchange(exchange, values)),
                            );
                    }

                    return res;
                }),
            );
    }
}
