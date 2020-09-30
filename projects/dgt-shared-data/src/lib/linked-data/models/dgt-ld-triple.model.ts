import { DGTEntity } from '../../metadata/models/dgt-entity.model';
import { DGTLDNode } from './dgt-ld-node.model';

export interface DGTLDTriple extends DGTEntity {
    exchange: string;
    predicate: string;
    subject: DGTLDNode;
    object: DGTLDNode;
    originalValue: DGTLDNode;
    source: string;
    connection: string;
}
