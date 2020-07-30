import { DGTEntity } from '@digita/dgt-shared-data/public-api';
import { DGTInviteState } from './dgt-invite-state.model';

export interface DGTInvite extends DGTEntity {
    subject: string;
    justification: string;
    state: DGTInviteState;
    connection?: string;
}
