import { DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { from, Observable, of, zip } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDFilterExchange } from '../../linked-data/models/dgt-ld-filter-exchange.model';
import { DGTLDFilterPartial } from '../../linked-data/models/dgt-ld-filter-partial.model';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTLDResourceTransformerService } from '../../linked-data/services/dgt-ld-resource-transformer.service';
import { DGTLDService } from '../../linked-data/services/dgt-ld.service';
import { DGTSecurityPolicyType } from '../../policy/models/dgt-security-policy-type.model';
import { DGTSecurityPolicyService } from '../../policy/services/dgt-security-policy.service';
import { DGTSparqlDatasetType } from '../../sparql/models/dgt-sparql-dataset-type.model';
import { DGTSparqlCommunicaService } from '../../sparql/services/dgt-sparql-communica.service';
import { DGTCacheService } from './dgt-cache.service';
import rawbody from 'raw-body';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTSparqlResult } from '../../sparql/models/dgt-sparql-result.model';

@DGTInjectable()
export class DGTCacheInMemoryService extends DGTCacheService {
    public cache: DGTLDResource[] = [];

    constructor(
        private logger: DGTLoggerService,
        private filters: DGTLDFilterService,
        private policies: DGTSecurityPolicyService,
        private exchanges: DGTExchangeService,
        private transformer: DGTLDResourceTransformerService,
        private ld: DGTLDService,
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
                tap(data => this.logger.debug(DGTCacheInMemoryService.name, 'Cache after save', { cache: this.cache })),
                map(data => data.resources),
            )
    }

    public query<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTCacheInMemoryService.name, 'Starting to query', { cache: this.cache, transformer, filter });

        return of({ resources: this.cache, transformer, filter })
            .pipe(
                switchMap(data => !data.filter ? of(data.resources) : this.filters.run(data.filter, data.resources)),
                tap(data => this.logger.debug(DGTCacheInMemoryService.name, 'Filtered resources', data)),
                switchMap(data => data && data.length > 0 ? transformer.toDomain(data) : of([])),
            );
    }

    public querySparql(query: string): Observable<string> {

        return of({ query })
            .pipe(
                switchMap(data => this.ld.query<DGTLDResource>(null, this.transformer)
                    .pipe(map(resources => ({ ...data, triples: _.flatten(resources.map(resource => resource.triples)) })))),
                switchMap(data => this.sparql.query({ triples: data.triples, type: DGTSparqlDatasetType.MEMORY }, data.query)),
                map(data => JSON.stringify(data.results)),
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
