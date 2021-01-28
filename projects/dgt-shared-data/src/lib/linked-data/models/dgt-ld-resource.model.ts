import { DGTLDTriple } from './dgt-ld-triple.model';

export interface DGTLDResource {
    shape?: string;
    uri: string;
    exchange: string;
    triples: DGTLDTriple[];
}
