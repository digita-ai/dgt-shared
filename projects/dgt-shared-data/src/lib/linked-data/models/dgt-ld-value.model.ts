import { DGTLDField } from './dgt-ld-field.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTLDValue extends DGTEntity {
    exchange: string;
    field: DGTLDField;
    subject: string;
    value: any;
    originalValue: any;
    source: string;
    provider: string;
}
