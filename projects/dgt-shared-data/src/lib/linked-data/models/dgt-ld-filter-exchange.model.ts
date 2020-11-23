import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTLDFilterType } from './dgt-ld-filter-type.model';

export interface DGTLDFilterExchange extends DGTLDFilter {
    type: DGTLDFilterType.EXCHANGE;
    exchanges: DGTExchange[];
}
