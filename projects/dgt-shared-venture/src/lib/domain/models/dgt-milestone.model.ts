import { DGTEntity } from '@digita-ai/dgt-shared-data';
import { DGTAcknowledgement } from './dgt-acknowledgement.model';
import { DGTAddress } from './dgt-address.model';
import { DGTDate } from './dgt-date.model';
import { DGTIdentity } from './dgt-identity.model';
import { DGTMilestoneState } from './dgt-milestone-state.model';

export interface DGTMilestone extends DGTEntity {
  lastAcknowledgement: Date;
  acknowledgements: DGTAcknowledgement[];
  dateOfMove: DGTDate;
  fromAddress: DGTAddress;
  identity: DGTIdentity;
  state: DGTMilestoneState;
  toAddress: DGTAddress;
  owner: string;
  validation: string;
}
