import { DGTEntity } from '../../metadata/models/dgt-entity.model';
import { DGTCategoryFilter } from './dgt-category-field.model';

export interface DGTCategory extends DGTEntity {
    icon: string;
    description: string;
    filters: DGTCategoryFilter[];
    groupId: string;
}
