import { DGTAddress } from './dgt-address.model';
import { DGTDate } from './dgt-date.model';
import { DGTIdentity } from './dgt-identity.model';
import { DGTMilestoneState } from './dgt-milestone-state.model';
import { DGTAcknowledgement } from './dgt-acknowledgement.model';
import { DGTEntity } from '@digita-ai/dgt-shared-data';

export interface DGTMilestone extends DGTEntity {
  lastAcknowledgement: Date;
  acknowledgements: Array<DGTAcknowledgement>;
  dateOfMove: DGTDate;
  fromAddress: DGTAddress;
  identity: DGTIdentity;
  state: DGTMilestoneState;
  toAddress: DGTAddress;
  owner: string;
  validation: string;
}
