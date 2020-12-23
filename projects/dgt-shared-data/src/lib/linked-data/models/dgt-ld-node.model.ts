import { DGTLDDataType } from './dgt-ld-data-type.model';
import { DGTLDTermType } from './dgt-ld-term-type.model';

export interface DGTLDNode {
    dataType?: DGTLDDataType;
    termType: DGTLDTermType;
    value: any;
}
