import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTInvite } from '../models/dgt-invite.model';
import { DGTInviteService } from './dgt-invite-abstract.service';

@DGTInjectable()
export class DGTInviteCacheService extends DGTInviteService {

    // TODO replace null with transformers

    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTInvite> {
        this.logger.debug(DGTInviteCacheService.name, 'Starting to get invite', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTInvite>(null, uri);
    }

    public query(filter?: DGTLDFilter): Observable<DGTInvite[]> {
        this.logger.debug(DGTInviteCacheService.name, 'Starting to query invites', filter);

        return this.cache.query(null, filter);
    }

    public save(resource: DGTInvite): Observable<DGTInvite> {
        this.logger.debug(DGTInviteCacheService.name, 'Starting to save resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        if (!resource.uri) {
            resource.uri = `http://someuri/exchanges#${v4()}`; // TODO set according to strategy
        }

        return of({ resource })
            .pipe(
                switchMap(data => this.cache.save(null, [resource])
                    .pipe(map(resources => _.head(resources)))),
            );
    }

    public delete(resource: DGTInvite): Observable<DGTInvite> {
        this.logger.debug(DGTInviteCacheService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ resource })
            .pipe(
                switchMap(data => this.cache.delete(null, [data.resource])
                    .pipe(map(resources => ({ ...data, resources })))),
                map(data => _.head(data.resources))
            );
    }

    public verify(inviteId: string): Observable<DGTInvite> {
        throw new DGTErrorNotImplemented();
    }
}
