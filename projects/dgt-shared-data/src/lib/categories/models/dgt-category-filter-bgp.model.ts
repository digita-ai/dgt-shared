import { DGTCategoryFilter } from './dgt-category-filter.model';
import { DGTLDPredicate } from '../../linked-data/models/dgt-ld-predicate.model';

export interface DGTCategoryFilterBGP extends DGTCategoryFilter {
    predicates: DGTLDPredicate[];
}