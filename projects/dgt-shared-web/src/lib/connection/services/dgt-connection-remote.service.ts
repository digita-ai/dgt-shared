import { DGTConnection, DGTConnectionService, DGTConnectionState, DGTLDFilter, DGTLDFilterService } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationBaseWeb, DGTConfigurationService, DGTErrorArgument, DGTErrorNotImplemented, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';

@DGTInjectable()
export class DGTConnectionRemoteService extends DGTConnectionService {
  constructor(
    public store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
    private http: DGTHttpService,
    private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
    private logger: DGTLoggerService,
    private filters: DGTLDFilterService,
  ) {
    super();
  }

  public save<T extends DGTConnection<any>>(resources: T[]): Observable<T[]> {
    this.logger.debug(DGTConnectionRemoteService.name, 'Starting to save', { resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        return of({ resources })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}connection` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => forkJoin(resources.map(resource => this.http.post<T>(data.uri, resource, { Authorization: `Bearer ${data.accessToken}` })
                    .pipe(map(response => response.data))))),
            );
  }

  public get<T extends DGTConnection<any>>(uri: string): Observable<T> {
    this.logger.debug(DGTConnectionRemoteService.name, 'Starting to get', { uri });

    if (!uri) {
      throw new DGTErrorArgument('Argument uri should be set.', uri);
    }

    return of({ uri })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}connection/${encodeURIComponent(data.uri)}` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => this.http.get<T>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
        map(response => response.data),
      );
  }

  public delete<T extends DGTConnection<any>>(resource: T): Observable<T> {
    this.logger.debug(DGTConnectionRemoteService.name, 'Starting to delete', { resource });

    if (!resource) {
        throw new DGTErrorArgument('Argument resource should be set.', resource);
    }

    return of({ resource }).pipe(
      map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}connection/${encodeURIComponent(data.resource.uri)}` })),
      switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
      switchMap(data => this.http.delete<T>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
      map(response => response.data),
    );
  }

  public query<T extends DGTConnection<any>>(filter?: DGTLDFilter): Observable<T[]> {
    this.logger.debug(DGTConnectionRemoteService.name, 'Starting to query', { filter });

    return of({ filter })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}connection` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => this.http.get<T[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })
          .pipe(map(response => ({ ...data, response })))),
        switchMap(data => data.filter ? this.filters.run<T>(data.filter, data.response.data) : of(data.response.data)),
      );
  }

  public getConnectionsWithWebId<T extends DGTConnection<any>>(webId: string): Observable<T[]> {
    throw new DGTErrorNotImplemented();
  }

  public getConnectionForInvite(inviteId: string, sourceId: string): Observable<{ state: DGTConnectionState, loginUri: string }> {
    this.logger.debug(DGTConnectionRemoteService.name, 'Sending link request to the backend', { inviteId, sourceId });

    if (!inviteId) {
      throw new DGTErrorArgument('Argument inviteId should be set.', inviteId);
    }

    if (!sourceId) {
      throw new DGTErrorArgument('Argument sourceId should be set.', sourceId);
    }

    return of({ sourceId, inviteId })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}invite/${encodeURIComponent(data.inviteId)}/link/${encodeURIComponent(data.sourceId)}` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => this.http.post<any>(data.uri, '', { Authorization: `Bearer ${data.accessToken}` })),
        map(res => res.data),
      );
  }

  public sendTokensForInvite<T extends DGTConnection<any>>(inviteId: string, fragment: string): Observable<T> {
    this.logger.debug(DGTConnectionRemoteService.name, 'Sending tokens to the backend and verifying rights', { inviteId, fragvalue: fragment });

    if (!inviteId) {
      throw new DGTErrorArgument('Argument inviteId should be set.', inviteId);
    }

    if (!fragment) {
      throw new DGTErrorArgument('Argument fragment should be set.', fragment);
    }

    const splitPerParam = fragment.split('&');

    let body = {};

    splitPerParam.forEach(param => {
      const key = param.split('=')[0];
      const val = param.split('=')[1];
      body = { ...body, [key]: val }
    });

    const headers = { 'Content-Type': 'application/json' };

    return of({ inviteId, body, headers })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}invite/${encodeURIComponent(data.inviteId)}/connection` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => this.http.post<T>(data.uri, body, { Authorization: `Bearer ${data.accessToken}`, 'Content-Type': 'application/json' })),
        map(res => res.data),
      );
  }

  getConnectionBySessionId(sessionId: string): Observable<DGTConnection<any>> {
    throw new Error('Method not implemented.');
  }
  
  public getConnectionsForHolder<T extends DGTConnection<any>>(holderUri: string): Observable<T[]> {
    return of({holderUri}).pipe(
      map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}holder/${encodeURIComponent(data.holderUri)}/connections` })),
      switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
      switchMap(data => this.http.get<T[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
      map(response => response.data),
    );
  }
}
