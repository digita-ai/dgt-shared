import { DGTLDNode } from './dgt-ld-node.model';

export interface DGTLDTriple {
    predicate: string;
    subject: DGTLDNode;
    object: DGTLDNode;
}
