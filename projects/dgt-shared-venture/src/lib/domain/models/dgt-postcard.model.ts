import { DGTEntity } from '@digita-ai/dgt-shared-data';
import { DGTAddress } from './dgt-address.model';

export interface DGTPostcard extends DGTEntity {
    address: DGTAddress;
    milestone: string;
}
