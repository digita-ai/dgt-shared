import { DGTLDTriple } from './dgt-ld-triple.model';

export interface DGTLDResource {
    id?: string; // TEMP FOR COMPATIBILITY
    uri: string;
    exchange: string;
    triples: DGTLDTriple[];
}
