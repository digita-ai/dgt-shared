import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTConfigurationService, DGTConfigurationBaseApi } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTExchange } from '../models/dgt-exchange.model';
import { DGTExchangeTransformerService } from './dgt-exchange-transformer.service';
import { DGTExchangeService } from './dgt-exchange.service';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

@DGTInjectable()
export class DGTExchangeCacheService extends DGTExchangeService {

    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTExchangeTransformerService,
        private uri: DGTUriFactoryService,
        private config: DGTConfigurationService<DGTConfigurationBaseApi>,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTExchange> {
        this.logger.debug(DGTExchangeCacheService.name, 'Starting to get exchange', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTExchange>(this.transformer, uri);
    }

    public query(filter?: DGTLDFilter): Observable<DGTExchange[]> {
        this.logger.debug(DGTExchangeCacheService.name, 'Starting to query exchanges', filter);

        return this.cache.query(this.transformer, filter);
    }

    public save(resources: DGTExchange[]): Observable<DGTExchange[]> {
        this.logger.debug(DGTExchangeCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({
            resources: resources.map(resource => {
                if (!resource.uri) {
                    resource.uri = this.uri.generate(resource, 'exchange');
                }

                return resource
            }),
        })
            .pipe(
                switchMap(data => this.cache.save(this.transformer, data.resources)
                    .pipe(map(savedResources => savedResources))),
            );
    }

    public delete(resource: DGTExchange): Observable<DGTExchange> {
        this.logger.debug(DGTExchangeCacheService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ resource })
            .pipe(
                // DELETE THE DATA KEPT IN STORAGE FOR THIS EXCHANGE
                switchMap(data => this.cache.delete(this.transformer, [{
                    uri: this.config.get(c => c.cache.uri) + 'data/' + encodeURIComponent(data.resource.uri),
                    exchange: null, triples: null,
                } as DGTLDResource]).pipe(
                    map( () => data)
                )),
                // DELETE THE EXCHANGE ITSELF
                switchMap(data => this.cache.delete(this.transformer, [data.resource])
                    .pipe(map(resources => ({ ...data, resources })))),
                map(data => _.head(data.resources)),
            );
    }
}
