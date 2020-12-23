import { DGTHolder } from '../../holder/models/dgt-holder.model';
import { DGTLDFilterType } from './dgt-ld-filter-type.model';
import { DGTLDFilter } from './dgt-ld-filter.model';

export interface DGTLDFilterHolder extends DGTLDFilter {
    type: DGTLDFilterType.HOLDER;
    holders: DGTHolder[];
}
