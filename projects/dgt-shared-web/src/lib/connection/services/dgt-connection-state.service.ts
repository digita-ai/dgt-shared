import { DGTConnectionService, DGTConnection, DGTLDFilter, DGTLDFilterService } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { of, Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTSaveConnection } from '../models/dgt-connection-actions.model';

@DGTInjectable()
export class DGTConnectionStateService extends DGTConnectionService {

  constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private logger: DGTLoggerService) {
    super();
  }

  public save<T extends DGTConnection<any>>(connections: T[]): Observable<T[]> {
    this.logger.debug(DGTConnectionStateService.name, 'Starting to save', { connections });

    if (!connections) {
      throw new DGTErrorArgument('Argument connections should be set.', connections);
    }

    return of({})
      .pipe(
        tap(() => this.store.dispatch(new DGTSaveConnection({ connections }))),
        map(() => connections),
        take(1),
      );
  }

  public get<T extends DGTConnection<any>>(uri: string): Observable<T> {
    this.logger.debug(DGTConnectionStateService.name, 'Starting to get', { uri });

    if (!uri) {
      throw new DGTErrorArgument('Argument uri should be set.', uri);
    }

    return of({ uri })
      .pipe(
        switchMap(data => this.store.select<DGTConnection<any>[]>(state => state.app.connections)
          .pipe(map((connections: T[]) => ({ ...data, connections })))),
        map(data => data.connections ? data.connections.find(c => c.uri === data.uri) : null),
        take(1),
      );
  }

  public delete<T extends DGTConnection<any>>(resource: T): Observable<T> {
    this.logger.debug(DGTConnectionStateService.name, 'Starting to delete', { resource });
    return of(resource as T);
  }

  public query<T extends DGTConnection<any>>(filter?: DGTLDFilter): Observable<T[]> {
    this.logger.debug(DGTConnectionStateService.name, 'Starting to query', { filter });

    return of({ filter })
      .pipe(
        switchMap(data => this.store.select<DGTConnection<any>[]>(state => state.app.connections)
          .pipe(map((connections: T[]) => ({ ...data, connections })))),
        switchMap(data => of(data.connections)),
        take(1),
      );
  }

  public getConnectionsWithWebId<T extends DGTConnection<any>>(webId: string): Observable<T[]> {
    throw new DGTErrorNotImplemented();
  }

  public getConnectionForInvite(inviteId: string, sourceId: string): Observable<any> {
    throw new DGTErrorNotImplemented();
  }

  public sendTokensForInvite<T extends DGTConnection<any>>(inviteId: string, fragvalue: string): Observable<T> {
    throw new DGTErrorNotImplemented();
  }

  public getConnectionBySessionId<T extends DGTConnection<any>>(sessionId: string): Observable<T> {
    this.logger.debug(DGTConnectionStateService.name, 'Starting to get', { sessionId });

    if (!sessionId) {
      throw new DGTErrorArgument('Argument sessionId should be set.', sessionId);
    }

    return of({ sessionId })
      .pipe(
        switchMap(data => this.store.select<DGTConnection<any>[]>(state => state.app.connections)
          .pipe(map((connections: T[]) => ({ ...data, connections })))),
        map(data => data.connections ? data.connections.find(c => c.configuration.sessionId === data.sessionId) : null),
        take(1),
      );
  }
}
