import { DGTValidationType } from './dgt-validation-type.model';
import { DGTValidationState } from './dgt-validation-state.model';
import { DGTIdentity } from './dgt-identity.model';
import { DGTEntity } from '@digita-ai/dgt-shared-data';

export interface DGTValidation extends DGTEntity {
    type: DGTValidationType,
    user: string,
    milestone: string,
    state: DGTValidationState,
    identity: DGTIdentity,
}
