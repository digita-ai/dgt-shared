import { DGTConnectionService, DGTConnection, DGTConfigurationBaseWeb } from '@digita-ai/dgt-shared-data';
import { Injectable } from '@angular/core';
import { DGTConfigurationService, DGTErrorArgument, DGTErrorNotImplemented, DGTHttpService, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@Injectable()
export class DGTConnectionRemoteService extends DGTConnectionService {

  constructor(
    public store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
    private paramChecker: DGTParameterCheckerService,
    private http: DGTHttpService,
    private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
    private logger: DGTLoggerService,
  ) {
    super();
  }

  public save(resource: DGTConnection<any>): Observable<DGTConnection<any>> {
    throw new DGTErrorNotImplemented();
  }

  public get(id: string): Observable<DGTConnection<any>> {
    this.logger.debug(DGTConnectionRemoteService.name, 'Starting to get', { id });

    if (!id) {
      throw new DGTErrorArgument('Argument id should be set.', id);
    }

    return of({ id })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}connection/${data.id}` })),
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
}
