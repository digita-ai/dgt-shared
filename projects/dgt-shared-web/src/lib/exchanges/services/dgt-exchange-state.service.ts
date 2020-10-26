import { DGTExchangeService, DGTExchange } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTExchangeStateService extends DGTExchangeService {

  constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private logger: DGTLoggerService,) {
    super();
  }

  public save(resource: DGTExchange): Observable<DGTExchange> {
    throw new DGTErrorNotImplemented();
  }

  public get(id: string): Observable<DGTExchange> {
    this.logger.debug(DGTExchangeStateService.name, 'Starting to get', { id });

    if (!id) {
      throw new DGTErrorArgument('Argument id should be set.', id);
    }

    return of({ id })
      .pipe(
        switchMap(data => this.store.select<DGTExchange[]>(state => state.app.exchanges)
          .pipe(map(exchanges => ({ ...data, exchanges })))),
        map(data => data.exchanges ? data.exchanges.find(c => c.id === data.id) : null),
      );
  }

  public delete(resource: DGTExchange): Observable<DGTExchange> {
    throw new DGTErrorNotImplemented();
  }

  public query(filter: Partial<DGTExchange>): Observable<DGTExchange[]> {
    throw new DGTErrorNotImplemented();
  }

  public getExchangesWithWebId(webId: string): Observable<DGTExchange[]> {
    throw new DGTErrorNotImplemented();
  }
}
