import { DGTSourceService, DGTSource } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTSourceStateService extends DGTSourceService {

  constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, logger: DGTLoggerService,) {
    super(logger);
  }

  public save(resource: DGTSource<any>): Observable<DGTSource<any>> {
    throw new DGTErrorNotImplemented();
  }

  public get(id: string): Observable<DGTSource<any>> {
    this.logger.debug(DGTSourceStateService.name, 'Starting to get', { id });

    if (!id) {
      throw new DGTErrorArgument('Argument id should be set.', id);
    }

    return of({ id })
      .pipe(
        switchMap(data => this.store.select<DGTSource<any>[]>(state => state.app.sources)
          .pipe(map(sources => ({ ...data, sources })))),
        map(data => data.sources ? data.sources.find(c => c.id === data.id) : null),
      );
  }

  public delete(resource: DGTSource<any>): Observable<DGTSource<any>> {
    throw new DGTErrorNotImplemented();
  }

  public query(filter: Partial<DGTSource<any>>): Observable<DGTSource<any>[]> {
    throw new DGTErrorNotImplemented();
  }

  public getConnectionsWithWebId(webId: string): Observable<DGTSource<any>[]> {
    throw new DGTErrorNotImplemented();
  }

  public linkSource(inviteId: string, sourceId: string): Observable<{ state: string; loginUri: string; }> {
    throw new DGTErrorNotImplemented();
  }
}
