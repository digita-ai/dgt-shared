import { DGTEntity } from '../../metadata/models/dgt-entity.model';
import { DGTLDNode } from './dgt-ld-node.model';
import { DGTLDTriple } from './dgt-ld-triple.model';

export interface DGTLDEntity extends DGTEntity {
    connection: string;
    source: string;
    subject: DGTLDNode;
    documentUri: string;
    triples: DGTLDTriple[];
}
