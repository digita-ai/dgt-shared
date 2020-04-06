import { DGTLDTermType } from './dgt-ld-term-type.model';
import { DGTLDDataType } from './dgt-ld-data-type.model';

export interface DGTLDNode {
    dataType?: DGTLDDataType;
    termType: DGTLDTermType;
    value: any;
}
