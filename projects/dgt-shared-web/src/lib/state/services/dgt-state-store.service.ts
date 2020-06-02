import { Observable } from 'rxjs';
import { DGTAction } from '../models/dgt-action.model';
import { DGTBaseRootState } from '../models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../models/dgt-base-app-state.model';
import { DGTStateSelector } from '../models/dgt-state-selector.model';

export abstract class DGTStateStoreService<T extends DGTBaseRootState<DGTBaseAppState>> {
    public abstract dispatch(action: DGTAction);
    public abstract select<K, L>(mapFn: (state: T) => K, selector?: DGTStateSelector<K, L>): Observable<L>;
}
