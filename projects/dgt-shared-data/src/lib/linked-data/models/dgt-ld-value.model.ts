import { DGTLDField } from './dgt-ld-field.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTLDValue extends DGTEntity {
    exchange: string;
    field: DGTLDField;
    justification: string;
    source: string;
    subject: string;
    value: any;
}
