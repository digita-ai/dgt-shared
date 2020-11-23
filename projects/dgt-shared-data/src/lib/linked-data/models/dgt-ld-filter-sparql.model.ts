import { DGTLDFilterType } from './dgt-ld-filter-type.model';
import { DGTLDFilter } from './dgt-ld-filter.model';

export interface DGTLDFilterSparql extends DGTLDFilter {
    type: DGTLDFilterType.SPARQL;
    sparql: string;
}
