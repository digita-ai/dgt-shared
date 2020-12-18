import { DGTAction } from './dgt-action.model';

export interface DGTAbstractAction<T> extends DGTAction {
    payload: T;
    onSuccess: DGTAction[];
    onFailure: DGTAction[];
}
