import { DGTProfileType } from './dgt-profile-type.model';
import { DGTUser } from '@digita-ai/dgt-shared-web';


export interface DGTProfile extends DGTUser {
    type: DGTProfileType;
    user: string;
    emailValidated: boolean;
    phone: string;
    email: string;
    hasSentInvites: boolean;
}
