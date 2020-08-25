import { DGTInviteState } from './dgt-invite-state.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTInvite extends DGTEntity {
    holder: string;
    justification: string;
    state: DGTInviteState;
    connection?: string;
}
