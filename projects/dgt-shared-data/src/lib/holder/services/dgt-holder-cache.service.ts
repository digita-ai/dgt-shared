import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTInviteService } from '../../invite/services/dgt-invite-abstract.service';
import { DGTLDFilterPartial } from '../../linked-data/models/dgt-ld-filter-partial.model';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTHolder } from '../models/dgt-holder.model';
import { DGTHolderService } from './dgt-holder-abstract.service';
import { DGTHolderTransformerService } from './dgt-holder-transformer.service';

@DGTInjectable()
export class DGTHolderCacheService extends DGTHolderService {
    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTHolderTransformerService,
        private uri: DGTUriFactoryService,
        private exchanges: DGTExchangeService,
        private connections: DGTConnectionService,
        private invites: DGTInviteService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTHolder> {
        this.logger.debug(DGTHolderCacheService.name, 'Starting to get holder', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTHolder>(this.transformer, uri);
    }

    public query(filter?: DGTLDFilter): Observable<DGTHolder[]> {
        this.logger.debug(DGTHolderCacheService.name, 'Starting to query holders', filter);

        return this.cache.query(this.transformer, filter);
    }

    public save(resources: DGTHolder[]): Observable<DGTHolder[]> {
        this.logger.debug(DGTHolderCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({
            resources,
        }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'holder')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as DGTHolder[] }))),
            ),
            concatMap((data) => this.cache.save(this.transformer, data.resources).pipe(map((res) => res))),
        );
    }

    public delete(resource: DGTHolder): Observable<DGTHolder> {
        this.logger.debug(DGTHolderCacheService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ resource }).pipe(
            switchMap((data) =>
                this.cache.delete(this.transformer, [data.resource]).pipe(map((resources) => ({ ...data, resources }))),
            ),
            map((data) => _.head(data.resources)),
        );
    }

    public merge(mainHolder: DGTHolder, otherHolders: DGTHolder[]): Observable<DGTHolder> {
        this.logger.debug(DGTHolderCacheService.name, 'Starting to merge holders', { mainHolder, otherHolders });

        if (!mainHolder) {
          throw new DGTErrorArgument('Argument mainHolder should be set.', mainHolder);
        }

        if (!otherHolders) {
          throw new DGTErrorArgument('Argument otherHolders should be set.', otherHolders);
        }

        return of({ mainHolder, otherHolders }).pipe(
            // Get exchanges
            switchMap((data) =>
                forkJoin(
                    data.otherHolders.map((holder) =>
                        this.exchanges.query({
                            type: DGTLDFilterType.PARTIAL,
                            partial: { holder: holder.uri },
                        } as DGTLDFilterPartial),
                    ),
                ).pipe(
                    map((exchanges) => ({
                        ...data,
                        exchanges: _.flatten(exchanges).map((exchange) => ({
                            ...exchange,
                            holder: data.mainHolder.uri,
                        })),
                    })),
                ),
            ),
            // Get connections
            switchMap((data) =>
                forkJoin(
                    data.otherHolders.map((holder) =>
                        this.connections.query({
                            type: DGTLDFilterType.PARTIAL,
                            partial: { holder: holder.uri },
                        } as DGTLDFilterPartial),
                    ),
                ).pipe(
                    map((connections) => ({
                        ...data,
                        connections: _.flatten(connections).map((connection) => ({
                            ...connection,
                            holder: data.mainHolder.uri,
                        })),
                    })),
                ),
            ),
            // Get invites
            switchMap((data) =>
                forkJoin(
                    data.otherHolders.map((holder) =>
                        this.invites.query({
                            type: DGTLDFilterType.PARTIAL,
                            partial: { holder: holder.uri },
                        } as DGTLDFilterPartial),
                    ),
                ).pipe(
                    map((invites) => ({
                        ...data,
                        invites: _.flatten(invites).map((invite) => ({
                            ...invite,
                            holder: data.mainHolder.uri,
                        })),
                    })),
                ),
            ),
            // Update exchanges
            switchMap((data) => this.exchanges.save(data.exchanges).pipe(map((exchanges) => ({ ...data, exchanges })))),
            // Update connections
            switchMap((data) =>
                this.connections.save(data.connections).pipe(map((connections) => ({ ...data, connections }))),
            ),
            // Delete holders
            switchMap((data) =>
                forkJoin(data.otherHolders.map((holder) => this.delete(holder))).pipe(
                    map((deletedHolders) => ({ ...data, deletedHolders })),
                ),
            ),
            map((data) => data.mainHolder),
        );
    }
}
