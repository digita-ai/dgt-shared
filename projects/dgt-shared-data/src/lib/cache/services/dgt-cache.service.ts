import { Observable, of, forkJoin } from 'rxjs';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { switchMap, map, tap, mergeMap } from 'rxjs/operators';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTQuery } from '../../metadata/models/dgt-query.model';

import * as _ from 'lodash';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTQueryService } from '../../metadata/services/dgt-query.service';

@DGTInjectable()
export class DGTCacheService {

    public cache: DGTLDTriple[];

    constructor(private logger: DGTLoggerService, private filterService: DGTLDFilterService, private queries: DGTQueryService) { 
        this.cache = [];
    }

    public getValuesForExchange(exchange: DGTExchange): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTCacheService.name, 'Retrieving values from cache for exchange', { exchange });

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        return of(this.cache.filter(triple => triple.exchange === exchange.id));
    }

    public remove(query: DGTQuery): Observable<any> {
        this.logger.debug(DGTCacheService.name, 'Removing values from cache', { query });

        if (!query) {
            throw new DGTErrorArgument('Argument query should be set.', query);
        }

        this.cache = this.queries.execute(this.cache, query);

        return of(this.cache);
    }

    public storeForExchange(exchange: DGTExchange, values: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTCacheService.name, 'Storing values for exchange to cache', { exchange, values });

        return of({ values, exchange })
            .pipe(
                switchMap(data => this.remove({ conditions: [{ field: 'exchange', operator: '==', value: data.exchange.id }] })
                    .pipe(map(removal => data))),
                tap(data => this.logger.debug(DGTCacheService.name, 'Removed old values, ready to store new ones', data)),
                tap(data => this.cache = data.values),
                map(data => data.values),
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
}
