import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTLDFilterType } from './dgt-ld-filter-type.model';

export interface DGTLDFilterPartial extends DGTLDFilter {
    type: DGTLDFilterType.PARTIAL;
    partial: any;
}
