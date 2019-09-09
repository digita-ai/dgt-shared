import { DGTProfile } from './dgt-profile.model';

export interface DGTPartner extends DGTProfile {
    name: string;
    address: string;
    logo: string;
    user: string;
}
