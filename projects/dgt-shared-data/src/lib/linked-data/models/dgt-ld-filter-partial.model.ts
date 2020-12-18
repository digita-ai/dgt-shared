import { DGTLDFilterType } from './dgt-ld-filter-type.model';
import { DGTLDFilter } from './dgt-ld-filter.model';

export interface DGTLDFilterPartial extends DGTLDFilter {
    type: DGTLDFilterType.PARTIAL;
    partial: any;
}
