import { DGTEntity } from '@digita/dgt-shared-data';

export interface DGTInvite extends DGTEntity {
    email: string;
    profile: string;
}
