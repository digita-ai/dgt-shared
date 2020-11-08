import { DGTConnectionService, DGTConnection, DGTLDFilter, DGTLDFilterService } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTConnectionStateService extends DGTConnectionService {

  constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private logger: DGTLoggerService, private filters: DGTLDFilterService) {
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
      );
  }

  public delete(resource: DGTConnection<any>): Observable<DGTConnection<any>> {
    throw new DGTErrorNotImplemented();
  }

  public query(filter?: DGTLDFilter): Observable<DGTConnection<any>[]> {
    this.logger.debug(DGTConnectionStateService.name, 'Starting to query', { filter });

    return of({ filter })
      .pipe(
        switchMap(data => this.store.select<DGTConnection<any>[]>(state => state.app.connections)
          .pipe(map(connections => ({ ...data, connections })))),
        switchMap(data => data.filter ? this.filters.run<DGTConnection<any>>(data.filter, data.connections) : of(data.connections)),
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
