import { DGTSource } from './dgt-source.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';

export interface DGTSourceResult<T> {
    source: DGTSource<T>;
    values: DGTLDTriple[];
}
