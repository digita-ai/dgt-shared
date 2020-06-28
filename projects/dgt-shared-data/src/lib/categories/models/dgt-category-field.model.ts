import { DGTLDPredicate } from '../../linked-data/models/dgt-ld-predicate.model';

export interface DGTCategoryField {
    predicates: DGTLDPredicate[];
    description: string;
}
