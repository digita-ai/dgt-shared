import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTExchange } from '@digita/dgt-shared-data/public-api';

export interface DGTLDFilterExchange extends DGTLDFilter {
    exchanges: DGTExchange[];
}
