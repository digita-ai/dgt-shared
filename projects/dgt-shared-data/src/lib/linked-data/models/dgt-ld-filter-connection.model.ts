import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTConnection } from '@digita/dgt-shared-data';

export interface DGTLDFilterConnection extends DGTLDFilter {
    connections: DGTConnection<any>[];
}
