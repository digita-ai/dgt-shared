import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { DGTLoggerService, DGTErrorArgument, DGTInjectable, DGTErrorNotImplemented } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTInviteService } from './dgt-invite-abstract.service';
import { DGTInvite } from '../models/dgt-invite.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';

@DGTInjectable()
export class DGTInviteMockService extends DGTInviteService {

  public resources: DGTInvite[] = [];

  constructor(
    private logger: DGTLoggerService, private filters: DGTLDFilterService
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

  public save(resource: DGTInvite): Observable<DGTInvite> {
    this.logger.debug(DGTInviteMockService.name, 'Starting to save resource', { resource });

    if (!resource) {
      throw new DGTErrorArgument('Argument connection should be set.', resource);
    }

    if (!resource.uri) {
      this.resources = [...this.resources, resource];
    } else {
      this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri), resource];
    }

    return of(resource);
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
