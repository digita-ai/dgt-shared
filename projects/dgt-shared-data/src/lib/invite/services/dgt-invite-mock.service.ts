import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTInvite } from '../models/dgt-invite.model';
import { DGTInviteService } from './dgt-invite-abstract.service';

@DGTInjectable()
export class DGTInviteMockService extends DGTInviteService {

  public resources: DGTInvite[] = [];

  constructor(
    private logger: DGTLoggerService, private filters: DGTLDFilterService, private uri: DGTUriFactoryService,
  ) {
    super();
  }

  public get(uri: string): Observable<DGTInvite> {
    return of(this.resources.find(e => e.uri === uri));
  }

  public query(filter?: DGTLDFilter): Observable<DGTInvite[]> {
    this.logger.debug(DGTInviteMockService.name, 'Starting to query invites', filter);

    return of({ filter, resources: this.resources })
      .pipe(
        switchMap(data => data.filter ? this.filters.run<DGTInvite>(data.filter, data.resources) : of(data.resources)),
      )
  }

  public save(resources: DGTInvite[]): Observable<DGTInvite[]> {
    this.logger.debug(DGTInviteMockService.name, 'Starting to save resources', { resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({ resources })
            .pipe(
                map(data => data.resources.map(resource => {
                    if (!resource.uri) {
                        resource.uri = this.uri.generate(resource, 'invite');
                    }

                    this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri), resource];

                    return resource;
                }),
                ),
            );
  }

  public delete(resource: DGTInvite): Observable<DGTInvite> {
    this.logger.debug(DGTInviteMockService.name, 'Starting to delete resource', { resource });

    if (!resource) {
      throw new DGTErrorArgument('Argument resource should be set.', resource);
    }

    this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri)];

    return of(resource);
  }

  public verify(inviteId: string): Observable<DGTInvite> {
    throw new DGTErrorNotImplemented();
  }
}
