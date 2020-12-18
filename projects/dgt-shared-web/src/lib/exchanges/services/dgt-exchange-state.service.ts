import { DGTExchange, DGTExchangeService, DGTLDFilter } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';

@DGTInjectable()
export class DGTExchangeStateService extends DGTExchangeService {

  constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private logger: DGTLoggerService) {
    super();
  }

  public save(resources: DGTExchange[]): Observable<DGTExchange[]> {
    throw new DGTErrorNotImplemented();
  }

  public get(uri: string): Observable<DGTExchange> {
    this.logger.debug(DGTExchangeStateService.name, 'Starting to get', { uri });

    if (!uri) {
      throw new DGTErrorArgument('Argument uri should be set.', uri);
    }

    return of({ uri })
      .pipe(
        switchMap(data => this.store.select<DGTExchange[]>(state => state.app.exchanges)
          .pipe(map(exchanges => ({ ...data, exchanges })))),
        map(data => data.exchanges ? data.exchanges.find(c => c.uri === data.uri) : null),
        take(1),
      );
  }

  public delete(resource: DGTExchange): Observable<DGTExchange> {
    throw new DGTErrorNotImplemented();
  }

  public query(filter?: DGTLDFilter): Observable<DGTExchange[]> {
    throw new DGTErrorNotImplemented();
  }

  public getExchangesWithWebId(webId: string): Observable<DGTExchange[]> {
    throw new DGTErrorNotImplemented();
  }
}
