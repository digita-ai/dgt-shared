import { DGTEntity, DGTLDNode, DGTConnection, DGTLDTriple } from '@digita/dgt-shared-data/public-api';

export interface DGTLDEntity extends DGTEntity {
    connection: string;
    source: string;
    subject: DGTLDNode;
    triples: DGTLDTriple[];
}
