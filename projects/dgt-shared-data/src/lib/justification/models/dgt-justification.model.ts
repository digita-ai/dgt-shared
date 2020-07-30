import { DGTLDPredicate } from '../../linked-data/models/dgt-ld-predicate.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTJustification extends DGTEntity {
  icon: string;
  description: string;
  predicates: DGTLDPredicate[];
  label?: string;
  aclNeeded?: string[];
}
