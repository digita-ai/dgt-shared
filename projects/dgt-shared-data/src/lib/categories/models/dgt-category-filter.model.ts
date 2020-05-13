import { DGTLDPredicate } from '../../linked-data/models/dgt-ld-predicate.model';

export interface DGTCategoryFilter {
    fields: DGTLDPredicate[];
    description: string;
}
