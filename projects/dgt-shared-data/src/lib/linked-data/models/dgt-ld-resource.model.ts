import { DGTEntity } from '../../metadata/models/dgt-entity.model';
import { DGTLDNode } from './dgt-ld-node.model';
import { DGTLDTriple } from './dgt-ld-triple.model';

export interface DGTLDResource extends DGTEntity {
    connection: string;
    source: string;
    holder: DGTLDNode;
    documentUri: string;
    triples: DGTLDTriple[];
}
