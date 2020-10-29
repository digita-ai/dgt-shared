import { DGTInviteState } from './dgt-invite-state.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTInvite extends DGTLDResource {
    holder: string;
    purpose: string;
    state: DGTInviteState;
    connection?: string;
}
