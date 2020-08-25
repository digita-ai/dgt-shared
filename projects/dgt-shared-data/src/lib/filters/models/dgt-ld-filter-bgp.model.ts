import { DGTLDFilter } from './dgt-ld-filter.model';
import { DGTLDPredicate } from '../../linked-data/models/dgt-ld-predicate.model';

export interface DGTLDFilterBGP extends DGTLDFilter {
    predicates: DGTLDPredicate[];
}
