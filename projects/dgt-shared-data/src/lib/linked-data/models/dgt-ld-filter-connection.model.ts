import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTConnection } from '../../connection/models/dgt-connection.model';

export interface DGTLDFilterConnection extends DGTLDFilter {
    connections: DGTConnection<any>[];
}
