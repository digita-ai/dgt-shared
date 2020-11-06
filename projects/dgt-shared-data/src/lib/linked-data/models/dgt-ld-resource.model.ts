import { DGTLDTriple } from './dgt-ld-triple.model';

export interface DGTLDResource {
    uri: string;
    exchange: string;
    triples: DGTLDTriple[];
}
