import { Observable } from 'rxjs';
import { DGTAction } from '../../state/models/dgt-action.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../models/dgt-base-app-state.model';
import { DGTQuery } from '@digita/dgt-shared-data';

export abstract class DGTStoreService<T extends DGTBaseRootState<DGTBaseAppState>> {
    public abstract dispatch(action: DGTAction);
    public abstract select<K>(mapFn: (state: T) => K, query?: DGTQuery): Observable<K>;
}
