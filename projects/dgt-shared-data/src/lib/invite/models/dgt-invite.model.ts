import { DGTEntity } from '@digita/dgt-shared-data/public-api';

export interface DGTInvite extends DGTEntity {
    subject: string;
    justification: string;
}
