import { DGTReducerMethod } from './dgt-reducer-method.model';
import { DGTAction } from './dgt-action.model';

export function reduceFactory<T>(initialState: T, methods: Array<DGTReducerMethod<DGTAction, T>>): (state: T, action: DGTAction) => T {
    return (state: T, action: DGTAction) => {
        let res: T = state;

        if (!res && initialState) {
            res = initialState;
        }

        if (methods) {
            const triggeredMethods = methods.filter(method => method.trigger === action.type);

            triggeredMethods.forEach(method => {
                res = method.method(action, res);
            });
        }

        return res;
    };
}
