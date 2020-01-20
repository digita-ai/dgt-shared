import { Observable, of, forkJoin } from 'rxjs';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { switchMap, map, tap } from 'rxjs/operators';
import { DGTDataService } from '../../metadata/services/dgt-data.service';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';
import { DGTSubject } from '../../subject/models/dgt-subject.model';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { DGTQuery } from '../../metadata/models/dgt-query.model';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTCacheService {
    constructor(private data: DGTDataService, private logger: DGTLoggerService) { }

    public getValues(): Observable<DGTLDValue[]> {
        this.logger.debug(DGTCacheService.name, 'Retrieving all values from cache');

        return this.data.getEntities<DGTLDValue>('value', null);
    }

    public getValuesForSubject(subject: DGTSubject): Observable<DGTLDValue[]> {
        this.logger.debug(DGTCacheService.name, 'Retrieving values from cache for subject', { subject });

        return of({ subject })
            .pipe(
                switchMap(data => this.data.getEntities<DGTLDValue>('value', {
                    conditions: [
                        {
                            field: 'subject',
                            operator: '==',
                            value: subject.id,
                        },
                    ],
                })),
            );
    }

    public getValuesForExchange(exchange: DGTExchange): Observable<DGTLDValue[]> {
        this.logger.debug(DGTCacheService.name, 'Retrieving values from cache for exchange', { exchange });

        return of({ exchange })
            .pipe(
                switchMap(data => this.data.getEntities<DGTLDValue>('value', {
                    conditions: [
                        {
                            field: 'exchange',
                            operator: '==',
                            value: exchange.id,
                        },
                    ],
                })),
            );
    }

    public remove(query: DGTQuery): Observable<any> {
        this.logger.debug(DGTCacheService.name, 'Removing values from cache', { query });

        return of({ query })
            .pipe(
                switchMap(data => this.data.getEntities<DGTLDValue>('value', data.query)
                    .pipe(map(values => ({ ...data, values })))),
                tap(data => this.logger.debug(DGTCacheService.name, 'Found old values to remove', data)),
                switchMap(data => data.values && data.values.length > 0 ?
                    forkJoin(data.values.map(value => this.data.deleteEntity('value', value.id))) : of(null)),
            );
    }

    public storeForExchange(exchange: DGTExchange, values: DGTLDValue[]): Observable<DGTLDValue[]> {
        this.logger.debug(DGTCacheService.name, 'Storing values for exchange to cache', { exchange, values });

        return of({ values, exchange })
            .pipe(
                switchMap(data => this.remove({ conditions: [{ field: 'exchange', operator: '==', value: data.exchange.id }] })
                    .pipe(map(removal => data))),
                tap(data => this.logger.debug(DGTCacheService.name, 'Removed old values, ready to store new ones', data)),
                switchMap(data => this.data.createEntities<DGTLDValue>('value', data.values)),
            );
    }

    public storeForSubject(subject: DGTSubject, values: DGTLDValue[]): Observable<DGTLDValue[]> {
        this.logger.debug(DGTCacheService.name, 'Storing values for subject to cache', { subject, values });

        return of({ values, subject })
            .pipe(
                switchMap(data => this.remove({ conditions: [{ field: 'subject', operator: '==', value: data.subject.id }] })
                    .pipe(map(removal => data))),
                tap(data => this.logger.debug(DGTCacheService.name, 'Removed old values, ready to store new ones', data)),
                switchMap(data => this.data.createEntities<DGTLDValue>('value', data.values)),
            );
    }
}
