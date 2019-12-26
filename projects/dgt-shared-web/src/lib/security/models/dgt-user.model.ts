import { DGTI8NEntity } from '../../i8n/models/dgt-i8n-entity.model';

export interface DGTUser extends DGTI8NEntity {
    id?: string;
    emailValidated: boolean;
    phone: string;
    email: string;
}
