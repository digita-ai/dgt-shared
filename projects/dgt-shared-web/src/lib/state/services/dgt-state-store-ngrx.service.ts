
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DGTBaseRootState } from '../models/dgt-base-root-state.model';
import { DGTStateStoreService } from './dgt-state-store.service';
import { DGTAction } from '../models/dgt-action.model';
import { DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { DGTBaseAppState } from '../models/dgt-base-app-state.model';
import { DGTQueryService } from '@digita-ai/dgt-shared-data';
import { DGTStateSelector } from '../models/dgt-state-selector.model';

@DGTInjectable()
export class DGTStateStoreNGRXService<T extends DGTBaseRootState<DGTBaseAppState>> extends DGTStateStoreService<T> {

    constructor(private logger: DGTLoggerService, private store: Store<T>, private queries: DGTQueryService) {
        super();
    }

    public dispatch(action: DGTAction) {
        this.logger.debug(DGTStateStoreNGRXService.name, 'Dispatching action.', action);

        this.store.dispatch(action);
    }

    public select<K, L=K>(mapFn: (state: T) => K, selector?: DGTStateSelector<K, L>): Observable<L> {
        this.logger.debug(DGTStateStoreNGRXService.name, 'Selecting value from store.', { mapFn, selector });

        return this.store.select(mapFn)
            .pipe(
                switchMap(data => selector ? selector.execute(data) : of(data as any))
            );
    }
}
