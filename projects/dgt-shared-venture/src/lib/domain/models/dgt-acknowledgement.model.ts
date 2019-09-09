import { DGTAcknowledgementType } from './dgt-acknowledgement-type.model';

export interface DGTAcknowledgement {
    date: Date;
    type: DGTAcknowledgementType;
}
