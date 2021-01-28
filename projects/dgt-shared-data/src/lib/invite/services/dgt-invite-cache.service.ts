import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTInvite } from '../models/dgt-invite.model';
import { DGTInviteService } from './dgt-invite-abstract.service';
import { DGTInviteTransformerService } from './dgt-invite-transformer.service';
import { DGTLDFilterPartial } from '../../linked-data/models/dgt-ld-filter-partial.model';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';

@DGTInjectable()
export class DGTInviteCacheService extends DGTInviteService {
    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTInviteTransformerService,
        private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTInvite> {
        this.logger.debug(DGTInviteCacheService.name, 'Starting to get invite', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTInvite>(this.transformer, uri);
    }

    public query(filter?: DGTLDFilter): Observable<DGTInvite[]> {
        this.logger.debug(DGTInviteCacheService.name, 'Starting to query invites', filter);

        return this.cache.query(this.transformer, filter);
    }

    public save(resources: DGTInvite[]): Observable<DGTInvite[]> {
        this.logger.debug(DGTInviteCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({
            resources,
        }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'invite')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as DGTInvite[] }))),
            ),
            switchMap((data) =>
                this.cache.save(this.transformer, data.resources).pipe(map((savedResources) => savedResources)),
            ),
        );
    }

    public delete(resource: DGTInvite): Observable<DGTInvite> {
        this.logger.debug(DGTInviteCacheService.name, 'Starting to delete resource', { resource });

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

    public verify(inviteId: string): Observable<DGTInvite> {
        throw new DGTErrorNotImplemented();
    }
    
    public getLink(inviteUri: string): Observable<string> {
        throw new DGTErrorNotImplemented();
    }
}
