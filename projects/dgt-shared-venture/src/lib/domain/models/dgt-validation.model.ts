import { DGTEntity } from '@digita-ai/dgt-shared-data';
import { DGTIdentity } from './dgt-identity.model';
import { DGTValidationState } from './dgt-validation-state.model';
import { DGTValidationType } from './dgt-validation-type.model';

export interface DGTValidation extends DGTEntity {
    type: DGTValidationType,
    user: string,
    milestone: string,
    state: DGTValidationState,
    identity: DGTIdentity,
}
