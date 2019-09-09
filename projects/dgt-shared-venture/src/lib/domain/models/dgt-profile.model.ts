import { DGTProfileType } from './dgt-profile-type.model';
import { DGTI8NEntity } from './dgt-i8n-entity.model';


export interface DGTProfile extends DGTI8NEntity {
    type: DGTProfileType;
    user: string;
    emailValidated: boolean;
    phone: string;
    email: string;
    hasSentInvites: boolean;
}
