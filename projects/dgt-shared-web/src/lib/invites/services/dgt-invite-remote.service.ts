import { Injectable } from '@angular/core';
import { DGTInvite, DGTInviteService, DGTLDFilter, DGTLDFilterService } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationBaseWeb, DGTConfigurationService, DGTErrorArgument, DGTHttpService, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';

@Injectable()
export class DGTInviteRemoteService extends DGTInviteService {
  constructor(
    private http: DGTHttpService,
    private logger: DGTLoggerService,
    private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
    public store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
    private filters: DGTLDFilterService,
  ) {
    super();
  }

  get(uri: string): Observable<DGTInvite> {
    if (!uri) {
      throw new DGTErrorArgument('Argument inviteId should be set.', uri);
    }

    return of({ uri })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}invite/${encodeURIComponent(data.uri)}` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => this.http.get<DGTInvite>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
        map(response => response.data),
      );
  }
  query(filter?: DGTLDFilter): Observable<DGTInvite[]> {
    return of({ filter }).pipe(
      map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}invite/` })),
      switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
      switchMap(data => this.http.get<DGTInvite[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })
        .pipe(map(response => ({ ...data, response})))),
      switchMap(data => data.filter ? this.filters.run<DGTInvite>(data.filter, data.response.data) : of(data.response.data)),
    );
  }
  save(resources: DGTInvite[]): Observable<DGTInvite[]> {
    this.logger.debug(DGTInviteRemoteService.name, 'Starting to save', { resources });

    if (!resources) {
        throw new DGTErrorArgument('Argument resources should be set.', resources);
    }

    return of({ resources }).pipe(
      map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}invite` })),
      switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
      switchMap(data => forkJoin(resources.map(resource => this.http.post<DGTInvite>(data.uri, resource, { Authorization: `Bearer ${data.accessToken}` })
          .pipe(map(response => response.data))))),
    );
  }
  delete(resource: DGTInvite): Observable<DGTInvite> {
    this.logger.debug(DGTInviteRemoteService.name, 'Starting to delete', { resource });

    if (!resource) {
        throw new DGTErrorArgument('Argument resource should be set.', resource);
    }

    return of({ resource }).pipe(
      map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}invite/${encodeURIComponent(data.resource.uri)}` })),
      switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
      switchMap(data => this.http.delete<DGTInvite>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
      map(response => response.data),
    );
  }

  public verify(inviteId: string): Observable<DGTInvite> {
    this.logger.debug(DGTInviteRemoteService.name, 'Starting to verify invite', { inviteId });

    if (!inviteId) {
      throw new DGTErrorArgument('Argument inviteId should be set.', inviteId);
    }

    return of({ inviteId })
    .pipe(
      map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}invite/${encodeURIComponent(data.inviteId)}/verify` })),
      switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
      switchMap(data => this.http.get<DGTInvite>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
      tap(invite => this.logger.debug(DGTInviteRemoteService.name, 'Verified invite', invite)),
      map(response => response.data),
    );
  }

  public getInvitesForHolder(holderUri: string): Observable<DGTInvite[]> {
    if (!holderUri) {
      throw new DGTErrorArgument('Parameter holderUri should be set', holderUri);
    }
    return of({holderUri}).pipe(
      map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}holder/${encodeURIComponent(data.holderUri)}/invites` })),
      switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
      switchMap(data => this.http.get<DGTInvite[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
      map(response => response.data),
    );
  }
}
