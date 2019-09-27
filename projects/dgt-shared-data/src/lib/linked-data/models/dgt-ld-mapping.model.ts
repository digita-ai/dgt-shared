import { DGTLDField } from './dgt-ld-field.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTLDMapping extends DGTEntity {
    from: DGTLDField;
    to: DGTLDField;
}
