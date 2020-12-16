import { Action } from '@ngrx/store/src/models';

export interface DGTAction extends Action {
    payload: any;
    onSuccess: DGTAction[];
    onFailure: DGTAction[];
}
