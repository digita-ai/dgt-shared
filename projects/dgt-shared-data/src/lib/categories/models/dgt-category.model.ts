import { DGTEntity } from '../../metadata/models/dgt-entity.model';
import { DGTLDField } from '../../linked-data/models/dgt-ld-field.model';

export interface DGTCategory extends DGTEntity {
    icon: string;
    description: string;
    fields: DGTLDField[];
}
