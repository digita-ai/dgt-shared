import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTLDFilterByCombinationType } from './dgt-ld-filter-filter-combination-type.model';

export interface DGTLDFilterCombination extends DGTLDFilter {
    combinationType: DGTLDFilterByCombinationType;
    filters: DGTLDFilter[];
}
