import { DGTInvite, DGTInviteService, DGTLDFilter } from '@digita-ai/dgt-shared-data';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DGTHttpService, DGTLoggerService, DGTErrorArgument, DGTConfigurationService, DGTConfigurationBaseWeb } from '@digita-ai/dgt-shared-utils';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@Injectable()
export class DGTInviteRemoteService extends DGTInviteService {
  constructor(
    private http: DGTHttpService,
    private logger: DGTLoggerService,
    private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
    public store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
  ) {
    super();
  }

  get(uri: string): Observable<DGTInvite> {
    if (!uri) {
      throw new DGTErrorArgument('Argument inviteId should be set.', uri);
    }

    return of({ uri })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}invite/${data.uri}` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => this.http.get<DGTInvite>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
        map(response => response.data),
      );
  }
  query(filter?: DGTLDFilter): Observable<DGTInvite[]> {
    throw new Error('Method not implemented.');
  }
  save(resource: DGTInvite): Observable<DGTInvite> {
    throw new Error('Method not implemented.');
  }
  delete(resource: DGTInvite): Observable<DGTInvite> {
    throw new Error('Method not implemented.');
  }

  public verify(inviteId: string): Observable<DGTInvite> {
    this.logger.debug(DGTInviteRemoteService.name, 'Starting to verify invite', { inviteId });

    if (!inviteId) {
      throw new DGTErrorArgument('Argument inviteId should be set.', inviteId);
    }

    return of({ inviteId })
    .pipe(
      map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}invite/${data.inviteId}/verify` })),
      switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
      switchMap(data => this.http.get<DGTInvite>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
      tap(invite => this.logger.debug(DGTInviteRemoteService.name, 'Verified invite', invite)),
      map(response => response.data),
    );
  }
}
