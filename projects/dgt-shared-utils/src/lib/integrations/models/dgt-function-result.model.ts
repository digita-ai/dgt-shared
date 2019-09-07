import { DGTFunctionResultState } from './dgt-function-result-state.model';

export interface DGTFunctionResult<T> {
    result: T,
    state: DGTFunctionResultState,
    finished: Date
}
