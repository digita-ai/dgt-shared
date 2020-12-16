import { DGTAction } from './dgt-action.model';
import { DGTReducerMethod } from './dgt-reducer-method.model';

export interface DGTReducer<T> {
    initialState: T;
    methods: DGTReducerMethod<DGTAction, T>[];
}
