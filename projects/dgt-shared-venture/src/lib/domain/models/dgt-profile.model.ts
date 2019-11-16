import { DGTProfileType } from './dgt-profile-type.model';
import { DGTI8NEntity, DGTUser } from '@digita/dgt-shared-web';


export interface DGTProfile extends DGTI8NEntity, DGTUser {
    type: DGTProfileType;
    user: string;
    emailValidated: boolean;
    phone: string;
    email: string;
    hasSentInvites: boolean;
}
