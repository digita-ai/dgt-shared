import { DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTSparqlResult } from '../../sparql/models/dgt-sparql-result.model';
import { DGTSparqlCommunicaService } from '../../sparql/services/dgt-sparql-communica.service';
import { DGTCacheService } from './dgt-cache.service';

@DGTInjectable()
export class DGTCacheInMemoryService extends DGTCacheService {
    public cache: DGTLDResource[] = [];

    constructor(
        private logger: DGTLoggerService,
        private filters: DGTLDFilterService,
        private sparql: DGTSparqlCommunicaService,
    ) {
        super();
    }

    public get<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, uri: string): Observable<T> {
        this.logger.debug(DGTCacheInMemoryService.name, 'Starting to get', { cache: this.cache, transformer, uri });

        return of({ uri, transformer })
            .pipe(
                map(data => ({ ...data, resources: this.cache.filter(resource => resource.uri === data.uri) })),
                tap(data => this.logger.debug(DGTCacheInMemoryService.name, 'Filtered resources', data)),
                switchMap(data => transformer.toDomain(data.resources)
                    .pipe(map(resources => _.head(resources)))),
                tap(data => this.logger.debug(DGTCacheInMemoryService.name, 'Found resource', data)),
            )
    }

    public delete<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resources: T[]): Observable<T[]> {
        this.logger.debug(DGTCacheInMemoryService.name, 'Starting to delete', { cache: this.cache, transformer, resources });

        this.cache = this.cache.filter(resource => !resources.some(r => r.uri === resource.uri))

        this.logger.debug(DGTCacheInMemoryService.name, 'Finished to delete', { cache: this.cache, transformer, resources });

        return of(resources);
    }

    public save<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resources: T[]): Observable<T[]> {
        this.logger.debug(DGTCacheInMemoryService.name, 'Starting to save', { transformer, resources });

        return of({ resources, transformer })
            .pipe(
                switchMap(data => transformer.toTriples(data.resources)
                    .pipe(map(transformed => ({ ...data, transformed })))),
                tap(data => this.logger.debug(DGTCacheInMemoryService.name, 'Transformed before save', data)),
                tap(data => this.cache = [...this.cache.filter(resource => !resources.some(r => r.uri === resource.uri && r.exchange === resource.exchange)), ...data.transformed]),
                tap(() => this.logger.debug(DGTCacheInMemoryService.name, 'Cache after save', { cache: this.cache })),
                map(data => data.resources),
            )
    }

    /**
     * Retrieves all DGTLDResources from the cache
     * @param transformer The transformer for this type of DGTLDResource
     * @param filter The filter to run on the retrieved list of DGTLDResources
     */
    public query<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTCacheInMemoryService.name, 'Starting to query', { cache: this.cache, transformer, filter });

        return of({ resources: this.cache, transformer, filter })
            .pipe(
                switchMap(data => !data.filter ? of(data.resources) : this.filters.run(data.filter, data.resources)),
                tap(data => this.logger.debug(DGTCacheInMemoryService.name, 'Filtered resources', data)),
                switchMap(data => data && data.length > 0 ? transformer.toDomain(data) : of([])),
            );
    }

    /**
     * Runs a SparQL query on data saved in memory
     * @param query The query to execute
     */
    public querySparql(query: string): Observable<DGTSparqlResult> {

        return of({ query })
            .pipe(
                map(data => ({ ...data, triples: _.flatten(this.cache.map(resource => resource.triples)) })),
                switchMap(data => this.sparql.query(data.query, { dataset: { triples: data.triples } })),
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
