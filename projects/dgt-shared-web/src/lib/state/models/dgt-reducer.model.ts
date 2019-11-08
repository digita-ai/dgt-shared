import { DGTReducerMethod } from './dgt-reducer-method.model';
import { DGTAction } from './dgt-action.model';

export interface DGTReducer<T> {
    initialState: T;
    methods: Array<DGTReducerMethod<DGTAction, T>>;
}
