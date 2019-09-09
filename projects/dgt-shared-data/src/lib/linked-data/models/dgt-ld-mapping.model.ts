import { DGTLDField } from './dgt-ld-field.model';
import { DGTEntity } from '@digita/dgt-shared-utils';

export interface DGTLDMapping extends DGTEntity {
    from: DGTLDField;
    to: DGTLDField;
}
