import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
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

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri, transformer }).pipe(
            map((data) => ({ ...data, resources: this.cache.filter((resource) => resource.uri === data.uri) })),
            tap((data) => this.logger.debug(DGTCacheInMemoryService.name, 'Filtered resources', data)),
            switchMap((data) => transformer.toDomain(data.resources).pipe(map((resources) => _.head(resources)))),
            tap((data) => this.logger.debug(DGTCacheInMemoryService.name, 'Found resource', data)),
        );
    }

    public delete<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resources: T[]): Observable<T[]> {
        this.logger.debug(DGTCacheInMemoryService.name, 'Starting to delete', {
            cache: this.cache,
            transformer,
            resources,
        });

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        this.cache = this.cache.filter((resource) => !resources.some((r) => r.uri === resource.uri));

        this.logger.debug(DGTCacheInMemoryService.name, 'Finished to delete', {
            cache: this.cache,
            transformer,
            resources,
        });

        return of(resources);
    }

    public save<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resources: T[]): Observable<T[]> {
        this.logger.info(DGTCacheInMemoryService.name, 'Starting to save', { transformer, resources });

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        return of({ resources, transformer }).pipe(
            switchMap((data) =>
                transformer.toTriples(data.resources).pipe(map((transformed) => ({ ...data, transformed }))),
            ),
            tap((data) => this.logger.info(DGTCacheInMemoryService.name, 'Transformed before save', data)),
            tap(
                (data) =>
                    (this.cache = [
                        ...this.cache.filter((resource) => !data.transformed.some((r) => r.uri === resource.uri)),
                        ...data.transformed,
                    ]),
            ),
            tap(() => this.logger.info(DGTCacheInMemoryService.name, 'Cache after save', { cache: this.cache })),
            map((data) => data.resources),
        );
    }

    /**
     * Retrieves all DGTLDResources from the cache
     * @param transformer The transformer for this type of DGTLDResource
     * @param filter The filter to run on the retrieved list of DGTLDResources
     */
    public query<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTCacheInMemoryService.name, 'Starting to query', { transformer, filter });

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ resources: this.cache, transformer, filter }).pipe(
            switchMap((data) => (!data.filter ? of(data.resources) : this.filters.run(data.filter, data.resources))),
            tap((data) => this.logger.debug(DGTCacheInMemoryService.name, 'Filtered resources', data)),
            switchMap((data) => (data && data.length > 0 ? transformer.toDomain(data) : of([]))),
        );
    }

    /**
     * Runs a SparQL query on data saved in memory
     * @param query The query to execute
     */
    public querySparql(query: string): Observable<DGTSparqlResult> {
        this.logger.debug(DGTCacheInMemoryService.name, 'Starting to query by string', { query });

        if (!query) {
            throw new DGTErrorArgument('Argument query should be set.', query);
        }

        return of({ query }).pipe(
            map((data) => ({ ...data, triples: _.flatten(this.cache.map((resource) => resource.triples)) })),
            switchMap((data) => this.sparql.query(data.query, { dataset: { triples: data.triples } })),
        );
    }

    public isStaleForExchange(exchange: DGTExchange): Observable<boolean> {
        return of(true);
    }
}
