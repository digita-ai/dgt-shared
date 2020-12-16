import { DGTConnection } from '@digita-ai/dgt-shared-data';
import { DGTAbstractAction } from '../../state/models/dgt-abstract-action.model';
import { DGTAction } from '../../state/models/dgt-action.model';

export const DGTConnectionActionTypes = {
    SAVE_CONNECTION: '[App] Save connection',
};


export interface DGTSaveConnectionPayload {
    connections: DGTConnection<any>[];
}

export class DGTSaveConnection implements DGTAbstractAction<DGTSaveConnectionPayload> {
    type = DGTConnectionActionTypes.SAVE_CONNECTION;

    constructor(public payload: DGTSaveConnectionPayload,
                public onSuccess: Array<DGTAction> = null,
                public onFailure: Array<DGTAction> = null) { }
}

