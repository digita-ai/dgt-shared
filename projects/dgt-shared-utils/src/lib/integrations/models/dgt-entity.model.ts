import { DGTActivity } from './dgt-activity.model';

export interface DGTEntity {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  upgradedAt?: Date;
  activities?: DGTActivity[];
}
