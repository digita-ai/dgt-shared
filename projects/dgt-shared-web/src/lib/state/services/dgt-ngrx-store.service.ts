import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStoreService } from './dgt-store.service';
import { DGTAction } from '../../state/models/dgt-action.model';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTBaseAppState } from '../models/dgt-base-app-state.model';
import { DGTQueryService, DGTQuery } from '@digita/dgt-shared-data';

@Injectable()
export class DGTNGRXStoreService<T extends DGTBaseRootState<DGTBaseAppState>> extends DGTStoreService<T> {

    constructor(private logger: DGTLoggerService, private store: Store<T>, private queries: DGTQueryService) {
        super();
     }

    public dispatch(action: DGTAction) {
        this.logger.debug(DGTNGRXStoreService.name, 'Dispatching action.', action);

        this.store.dispatch(action);
    }

    public select<K>(mapFn: (state: T) => K, query?: DGTQuery): Observable<K> {
        this.logger.debug(DGTNGRXStoreService.name, 'Selecting value from store.', mapFn);

        return this.store.select(mapFn)
            .pipe(
                map(data => this.queries.execute<K>(data, query))
            );
    }
}
