import { DGTConnectionService, DGTConnection, DGTConfigurationBaseWeb, DGTConnectionState } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationService, DGTErrorArgument, DGTErrorNotImplemented, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { of, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTConnectionRemoteService extends DGTConnectionService {

  constructor(
    public store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
    private http: DGTHttpService,
    private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
    private logger: DGTLoggerService,
  ) {
    super();
  }

  public save(resource: DGTConnection<any>): Observable<DGTConnection<any>> {
    throw new DGTErrorNotImplemented();
  }

  public get(uri: string): Observable<DGTConnection<any>> {
    this.logger.debug(DGTConnectionRemoteService.name, 'Starting to get', { uri });

    if (!uri) {
      throw new DGTErrorArgument('Argument uri should be set.', uri);
    }

    return of({ uri })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}connection/${data.uri}` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => this.http.get<DGTConnection<any>>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
        map(response => response.data),
      );
  }

  public delete(resource: DGTConnection<any>): Observable<DGTConnection<any>> {
    throw new DGTErrorNotImplemented();
  }

  public query(filter: Partial<DGTConnection<any>>): Observable<DGTConnection<any>[]> {
    this.logger.debug(DGTConnectionRemoteService.name, 'Starting to query', { filter });

    if (!filter) {
      throw new DGTErrorArgument('Argument filter should be set.', filter);
    }

    return of({ filter })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}connection` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => this.http.get<DGTConnection<any>[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
        map(response => _.filter<DGTConnection<any>>(response.data, filter)),
      );
  }

  public getConnectionsWithWebId(webId: string): Observable<DGTConnection<any>[]> {
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

    return this.http.post<any>(
      `${this.config.get(c => c.server.uri)}invite/${inviteId}/link/${sourceId}`, {}
    ).pipe(
      map(res => {
        if (res.status === 201) {
          return res.data;
        } else {
          this.logger.debug(DGTConnectionRemoteService.name, 'Response status is ', res.status);
          return null;
        }
      }),
    );
  }

  public sendTokensForInvite(inviteId: string, fragment: string): Observable<DGTConnection<any>> {
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

    return this.http.post<DGTConnection<any>>(
      `${this.config.get(c => c.server.uri)}invite/${inviteId}/connection`, body, headers
    ).pipe(
      map(response => response.data),
      tap(connection => this.logger.debug(DGTConnectionRemoteService.name, 'Sent tokens', connection))
    );
  }
}
