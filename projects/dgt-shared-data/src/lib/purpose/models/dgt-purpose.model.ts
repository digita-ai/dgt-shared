import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTPurpose extends DGTEntity {
  icon: string;
  description: string;
  predicates: string[];
  label?: string;
  aclNeeded?: string[];
}
