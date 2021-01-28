import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDFilterPartial } from '../../linked-data/models/dgt-ld-filter-partial.model';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTConnection } from '../models/dgt-connection.model';
import { DGTConnectionService } from './dgt-connection-abstract.service';
import { DGTConnectionTransformerService } from './dgt-connection-transformer.service';

@DGTInjectable()
export class DGTConnectionCacheService extends DGTConnectionService {
    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTConnectionTransformerService,
        private uri: DGTUriFactoryService,
        private exchanges: DGTExchangeService,
    ) {
        super();
    }

    public get<T extends DGTConnection<any>>(uri: string): Observable<T> {
        this.logger.debug(DGTConnectionCacheService.name, 'Starting to get connection', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<T>(this.transformer, uri);
    }

    public query<T extends DGTConnection<any>>(filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTConnectionCacheService.name, 'Starting to query connections', filter);

        return this.cache.query<T>(this.transformer, filter);
    }

    public save<T extends DGTConnection<any>>(resources: T[]): Observable<T[]> {
        this.logger.debug(DGTConnectionCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({
            resources,
        }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'connection')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as T[] }))),
            ),
            switchMap((data) => this.cache.save<T>(this.transformer, data.resources).pipe(map((res) => res))),
        );
    }
    public delete<T extends DGTConnection<any>>(resource: T): Observable<T> {
        this.logger.debug(DGTConnectionCacheService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ resource }).pipe(
            // GET ALL EXCHANGES CONNECTED TO THIS CONNECTION
            switchMap((data) =>
                this.exchanges
                    .query({
                        type: DGTLDFilterType.PARTIAL,
                        partial: { connection: data.resource.uri },
                    } as DGTLDFilterPartial)
                    .pipe(map((exchanges) => ({ ...data, exchanges }))),
            ),
            // DELETE ALL EXCHANGES CONNECTED TO THIS CONNECTION
            switchMap((data) =>
                data.exchanges.length > 0
                    ? forkJoin(data.exchanges.map((ex) => this.exchanges.delete(ex))).pipe(
                          map((deletedExchanges) => data),
                      )
                    : of(data),
            ),
            // DELETE THE CONNECTION ITSELF
            switchMap((data) =>
                this.cache
                    .delete<T>(this.transformer, [data.resource])
                    .pipe(map((resources) => ({ ...data, resources }))),
            ),
            map((data) => _.head(data.resources)),
        );
    }
    public getConnectionsWithWebId<T extends DGTConnection<any>>(webId: string): Observable<T[]> {
        return this.query<T>().pipe(
            map((connections) => connections.filter((connection) => connection.configuration.webId === webId)),
        );
    }
    public getConnectionForInvite<T extends DGTConnection<any>>(inviteId: string, sourceId: string): Observable<any> {
        throw new DGTErrorNotImplemented();
    }
    public sendTokensForInvite<T extends DGTConnection<any>>(inviteId: string, fragvalue: string): Observable<T> {
        throw new DGTErrorNotImplemented();
    }
    public getConnectionsForHolder(holderUri: string): Observable<DGTConnection<any>[]> {
        throw new DGTErrorNotImplemented();
    }
}
