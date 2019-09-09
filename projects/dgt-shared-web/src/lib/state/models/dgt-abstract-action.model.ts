import { DGTAction } from './dgt-action.model';

export interface DGTAbstractAction<T> extends DGTAction {
    payload: T;
    onSuccess: Array<DGTAction>;
    onFailure: Array<DGTAction>;
}
