import { Observable, of, forkJoin } from 'rxjs';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { switchMap, map, tap, mergeMap, mergeAll } from 'rxjs/operators';
import { DGTDataService } from '../../metadata/services/dgt-data.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTQuery } from '../../metadata/models/dgt-query.model';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDFilterExchange } from '../../linked-data/models/dgt-ld-filter-exchange.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';

@Injectable()
export class DGTCacheService {

    public cache: DGTLDTriple[];

    constructor(private data: DGTDataService, private logger: DGTLoggerService, private filterService: DGTLDFilterService) { 
        this.cache = [];
    }

    public getValuesForExchange(exchange: DGTExchange): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTCacheService.name, 'Retrieving values from cache for exchange', { exchange });

        // const filterExchange: DGTLDFilterExchange = {
        //     type: DGTLDFilterType.EXCHANGE,
        //     exchanges: [
        //         exchange
        //     ]
        // };
        // return this.data.getEntities<DGTLDTriple>('value', null).pipe(
        //     switchMap(triples => this.filterService.run(filterExchange, triples))
        // );

        return of({ exchange })
            .pipe(
                switchMap(data => this.data.getEntities<DGTLDTriple>('value', {
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
                switchMap(data => this.data.getEntities<DGTLDTriple>('value', data.query)
                    .pipe(map(values => ({ ...data, values })))),
                tap(data => this.logger.debug(DGTCacheService.name, 'Found old values to remove', data)),
                switchMap(data => data.values && data.values.length > 0 ?
                    forkJoin(data.values.map(value => this.data.deleteEntity('value', value.id))) : of(null)),
            );
    }

    public storeForExchange(exchange: DGTExchange, values: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTCacheService.name, 'Storing values for exchange to cache', { exchange, values });

        return of({ values, exchange })
            .pipe(
                switchMap(data => this.remove({ conditions: [{ field: 'exchange', operator: '==', value: data.exchange.id }] })
                    .pipe(map(removal => data))),
                tap(data => this.logger.debug(DGTCacheService.name, 'Removed old values, ready to store new ones', data)),
                switchMap(data => this.data.createEntities<DGTLDTriple>('value', data.values)),
            );
    }

    public query<T>(filter: DGTLDFilter, transformer: DGTLDTransformer<T>): Observable<DGTLDTriple[] | T[]> {
        return of(this.cache).pipe(mergeMap(tripleArray => {
            let res;
            if (filter) {
                res = this.filterService.run(filter, tripleArray);
            } else {
                res = of(tripleArray);
            }
            return transformer ? transformer.toDomain(res) : res;
        }));
    }

    public isFilled(): boolean {
        return this.cache.length > 0;
    }

    private getAllValues(): Observable<DGTLDTriple[]> {

        // TODO check if getEntities with null query returns everything
        return this.data.getEntities<DGTExchange>('exchange', null).pipe(
            tap(exchanges => this.logger.debug(DGTCacheService.name, 'EEEEEEEExchanges: ', exchanges)),
            mergeMap(exchanges => 
                exchanges.map(exchange => this.data.getEntities<DGTLDTriple>('value', { conditions: [{ field: 'exchange', operator: '==', value: exchange.id }] }))
            ),
            mergeAll(),
            tap(values => this.logger.debug(DGTCacheService.name, 'values', values))
        );
    }
}
