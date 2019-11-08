import { DGTAction } from './dgt-action.model';


export interface DGTReducerMethod<T extends DGTAction, S> {
    trigger: string;
    method: (action: T, state: S) => S;
}
