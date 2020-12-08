import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
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
    ) {
        super();
    }

    public get(uri: string): Observable<DGTConnection<any>> {
        this.logger.debug(DGTConnectionCacheService.name, 'Starting to get connection', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get(this.transformer, uri);
    }

    public query(filter?: DGTLDFilter): Observable<DGTConnection<any>[]> {
        this.logger.debug(DGTConnectionCacheService.name, 'Starting to query connections', filter);

        return this.cache.query(this.transformer, filter);
    }

    public save(resources: DGTConnection<any>[]): Observable<DGTConnection<any>[]> {
        this.logger.debug(DGTConnectionCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({
            resources: resources.map(resource => {
                if (!resource.uri) {
                    resource.uri = this.uri.generate(resource, 'connection');
                }

                return resource;
            })
        })
            .pipe(
                switchMap(data => this.cache.save(this.transformer, data.resources)
                    .pipe(map(res => res))),
            );
    }
    public delete<T extends DGTConnection<any>>(resource: T): Observable<T> {
        this.logger.debug(DGTConnectionCacheService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ resource })
            .pipe(
                switchMap(data => this.cache.delete<T>(this.transformer, [data.resource])
                    .pipe(map(resources => ({ ...data, resources })))),
                map(data => _.head(data.resources))
            );
    }
    public getConnectionsWithWebId(webId: string): Observable<DGTConnection<any>[]> {
        return this.query().pipe(
            map(connections => connections.filter(connection => connection.configuration.webId === webId))
        );
    }
    public getConnectionForInvite(inviteId: string, sourceId: string): Observable<DGTConnection<any>> {
        throw new DGTErrorNotImplemented();
    }
    public sendTokensForInvite(inviteId: string, fragvalue: string): Observable<DGTConnection<any>> {
        throw new DGTErrorNotImplemented();
    }
}