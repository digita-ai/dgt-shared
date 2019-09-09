import { DGTLDField } from './dgt-ld-field.model';
import { DGTEntity } from '@digita/dgt-shared-utils';

export interface DGTLDValue extends DGTEntity {
    exchange: string;
    field: DGTLDField;
    justification: string;
    source: string;
    subject: string;
    value: any;
}
