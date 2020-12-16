import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTInviteState } from './dgt-invite-state.model';

export interface DGTInvite extends DGTLDResource {
    holder: string;
    purpose: string;
    state: DGTInviteState;
    connection?: string;
}
