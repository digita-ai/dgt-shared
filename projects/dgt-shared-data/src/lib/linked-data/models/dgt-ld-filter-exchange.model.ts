import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';

export interface DGTLDFilterExchange extends DGTLDFilter {
    exchanges: DGTExchange[];
}
