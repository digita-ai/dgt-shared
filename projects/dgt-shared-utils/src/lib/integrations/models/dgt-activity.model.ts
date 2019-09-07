import { DGTEntity } from './dgt-entity.model';
import { DGTActivityVisibility } from './dgt-activity-visibility.model';

export interface DGTActivity extends DGTEntity {
  type: string;
  description: string;
  visibility: DGTActivityVisibility;
  difference: any;
  responsible: string;
}
