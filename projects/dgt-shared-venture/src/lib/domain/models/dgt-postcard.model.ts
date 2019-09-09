import { DGTAddress } from './dgt-address.model';
import { DGTEntity } from '@digita/dgt-shared-data';

export interface DGTPostcard extends DGTEntity {
    address: DGTAddress;
    milestone: string;
}
