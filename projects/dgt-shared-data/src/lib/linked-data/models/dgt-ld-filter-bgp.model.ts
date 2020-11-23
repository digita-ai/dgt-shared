import { DGTLDFilterType } from './dgt-ld-filter-type.model';
import { DGTLDFilter } from './dgt-ld-filter.model';

export interface DGTLDFilterBGP extends DGTLDFilter {
    type: DGTLDFilterType.BGP;
    predicates: string[];
}
