import { DGTEntity } from '@digita-ai/dgt-shared-data';

export interface DGTInvite extends DGTEntity {
    email: string;
    profile: string;
}
