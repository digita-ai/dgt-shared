import { DGTUpdateState } from './dgt-update-state.model';
import { DGTUpdateType } from './dgt-update-type.model';
import { DGTAddress } from './dgt-address.model';
import { DGTIdentity } from './dgt-identity.model';
import { DGTDate } from './dgt-date.model';
import { DGTEntity } from '@digita-ai/dgt-shared-data';

export interface DGTUpdate extends DGTEntity {
    brand: string;
    brandName: string;
    partner: string;
    partnerName: string;
    milestone: string;
    profile: string;
    state: DGTUpdateState;
    type: DGTUpdateType;
    fromAddress: DGTAddress;
    toAddress: DGTAddress;
    dateOfMove: DGTDate;
    identity: DGTIdentity;
    validationId: string;
    dateOfValidity: Date;
    gift: string;
    phone: string;
    email: string;
    dateSent: Date;
    feedback: string;
}
