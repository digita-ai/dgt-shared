import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTPurpose extends DGTLDResource {
  icon: string;
  description: string;
  predicates: string[];
  label?: string;
  aclNeeded?: string[];
}
