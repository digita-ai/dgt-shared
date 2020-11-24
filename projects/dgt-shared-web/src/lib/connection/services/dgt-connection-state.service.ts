import { DGTConnectionService, DGTConnection } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { of, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTConnectionStateService extends DGTConnectionService {

  constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private logger: DGTLoggerService,) {
    super();
  }

  public save(resource: DGTConnection<any>): Observable<DGTConnection<any>> {
    throw new DGTErrorNotImplemented();
  }

  public get(uri: string): Observable<DGTConnection<any>> {
    this.logger.debug(DGTConnectionStateService.name, 'Starting to get', { uri });

    if (!uri) {
      throw new DGTErrorArgument('Argument uri should be set.', uri);
    }

    return of({ uri })
      .pipe(
        switchMap(data => this.store.select<DGTConnection<any>[]>(state => state.app.connections)
          .pipe(map(connections => ({ ...data, connections })))),
        map(data => data.connections ? data.connections.find(c => c.uri === data.uri) : null),
        take(1),
      );
  }

  public delete(resource: DGTConnection<any>): Observable<DGTConnection<any>> {
    throw new DGTErrorNotImplemented();
  }

  public query(filter: Partial<DGTConnection<any>>): Observable<DGTConnection<any>[]> {
    this.logger.debug(DGTConnectionStateService.name, 'Starting to query', { filter });

    if (!filter) {
      throw new DGTErrorArgument('Argument filter should be set.', filter);
    }

    return of({ filter })
      .pipe(
        switchMap(data => this.store.select<DGTConnection<any>[]>(state => state.app.connections)
          .pipe(map(connections => ({ ...data, connections })))),
        map(data => _.filter(data.connections, data.filter)),
        take(1),
      )
  }

  public getConnectionsWithWebId(webId: string): Observable<DGTConnection<any>[]> {
    throw new DGTErrorNotImplemented();
  }

  public getConnectionForInvite(inviteId: string, sourceId: string): Observable<any> {
    throw new DGTErrorNotImplemented();
  }
  
  public sendTokensForInvite(inviteId: string, fragvalue: string): Observable<DGTConnection<any>> {
    throw new DGTErrorNotImplemented();
  }
}
