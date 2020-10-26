import { Observable, of } from 'rxjs';
import { DGTInjectable, DGTLoggerService, DGTMap } from '@digita-ai/dgt-shared-utils';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTQueryService } from '../../metadata/services/dgt-query.service';
import { DGTCacheService } from './dgt-cache.service';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

@DGTInjectable()
export class DGTCacheInMemoryService extends DGTCacheService {
    public cache: DGTLDResource[] = [];

    constructor(private logger: DGTLoggerService, private filterService: DGTLDFilterService, private queries: DGTQueryService) {
        super();
    }

    public delete<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resources: T[]): Observable<T[]> {
        throw new Error('Method not implemented.');
    }

    public save<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resources: T[]): Observable<T[]> {
        this.logger.debug(DGTCacheInMemoryService.name, 'Starting to save', { transformer, resources });

        return of({ resources, transformer })
            .pipe(
                tap(data => this.cache = data.resources),
                map(data => data.resources)
            )
    }

    public query<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, filter: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTCacheInMemoryService.name, 'Starting to query', { cache: this.cache, transformer, filter });

        return of({ resources: this.cache, transformer, filter })
            .pipe(
                switchMap(data => !data.filter ? of(data.resources) : this.filterService.run(data.filter, data.resources)),
                switchMap(data => transformer.toDomain(data))
            );
    }

    // public getValuesForExchange(exchange: DGTExchange): Observable<DGTLDTriple[]> {
    //     this.logger.debug(DGTCacheInMemoryService.name, 'Retrieving values from cache for exchange', { exchange });
    //     if (!exchange) {
    //         throw new DGTErrorArgument('Argument exchange should be set.', exchange);
    //     }
    //     return of(this.cache.filter(triple => triple.exchange === exchange.id));
    // }
    // public remove(query: DGTQuery): Observable<any> {
    //     this.logger.debug(DGTCacheInMemoryService.name, 'Removing values from cache', { query });
    //     if (!query) {
    //         throw new DGTErrorArgument('Argument query should be set.', query);
    //     }
    //     this.cache = this.queries.execute(this.cache, query);
    //     return of(this.cache);
    // }
    // public storeForExchange(exchange: DGTExchange, values: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    //     this.logger.debug(DGTCacheInMemoryService.name, 'Storing values for exchange to cache', { exchange, values });
    //     return of({ values, exchange })
    //         .pipe(
    //             switchMap(data => this.remove({ conditions: [{ field: 'exchange', operator: '==', value: data.exchange.id }] })
    //                 .pipe(map(removal => data))),
    //             tap(data => this.logger.debug(DGTCacheInMemoryService.name, 'Removed old values, ready to store new ones', data)),
    //             tap(data => this.cache = data.values),
    //             map(data => data.values),
    //         );
    // }
}