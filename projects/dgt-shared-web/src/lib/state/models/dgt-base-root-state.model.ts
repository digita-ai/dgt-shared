import { DGTBaseAppState } from './dgt-base-app-state.model';

export interface DGTBaseRootState<T extends DGTBaseAppState> {
    app: T;
}
