import { DGTEntity } from '@digita/dgt-shared-utils';
import { DGTLDField } from '../../linked-data/models/dgt-ld-field.model';

export interface DGTJustification extends DGTEntity {
    fields: DGTLDField[];
}
