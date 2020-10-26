import { DGTEntity } from '../../metadata/models/dgt-entity.model';
import { DGTLDNode } from './dgt-ld-node.model';

export interface DGTLDTriple extends DGTEntity {
    predicate: string;
    subject: DGTLDNode;
    object: DGTLDNode;
}
