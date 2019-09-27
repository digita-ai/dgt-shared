import { DGTLDField } from '../../linked-data/models/dgt-ld-field.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTJustification extends DGTEntity {
    fields: DGTLDField[];
}
