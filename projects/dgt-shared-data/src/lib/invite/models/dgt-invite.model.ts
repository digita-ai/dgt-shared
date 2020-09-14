import { DGTInviteState } from './dgt-invite-state.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTInvite extends DGTEntity {
    holder: string;
    purpose: string;
    state: DGTInviteState;
    connection?: string;
}
