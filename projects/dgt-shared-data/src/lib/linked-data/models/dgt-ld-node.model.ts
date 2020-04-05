import { DGTLDNodeType } from './dgt-ld-node-type.model';
import { DGTLDDataType } from './dgt-ld-data-type.model';

export interface DGTLDNode {
    dataType?: DGTLDDataType;
    type: DGTLDNodeType;
    value: any;
}
