import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTLDFilterByCombinationType } from './dgt-ld-filter-combination-type.model';
import { DGTLDFilterType } from './dgt-ld-filter-type.model';

export interface DGTLDFilterCombination extends DGTLDFilter {
    type: DGTLDFilterType.COMBINATION;
    combinationType: DGTLDFilterByCombinationType;
    filters: DGTLDFilter[];
}
