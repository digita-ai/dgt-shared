import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';

export interface DGTLDFilterExchange extends DGTLDFilter {
    exchanges: DGTExchange[];
}
