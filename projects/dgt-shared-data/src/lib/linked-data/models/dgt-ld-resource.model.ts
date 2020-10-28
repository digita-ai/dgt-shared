import { DGTEntity } from '../../metadata/models/dgt-entity.model';
import { DGTLDTriple } from './dgt-ld-triple.model';

export interface DGTLDResource extends DGTEntity {
    uri: string;
    exchange: string;
    triples: DGTLDTriple[];
}
