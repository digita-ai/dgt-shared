import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTLDFilterType } from './dgt-ld-filter-type.model';
import { DGTLDFilter } from './dgt-ld-filter.model';

export interface DGTLDFilterConnection extends DGTLDFilter {
    type: DGTLDFilterType.CONNECTION;
    connections: DGTConnection<any>[];
}
