import { DGTAddress } from './dgt-address.model';
import { DGTEntity } from '@digita-ai/dgt-shared-data';

export interface DGTPostcard extends DGTEntity {
    address: DGTAddress;
    milestone: string;
}
