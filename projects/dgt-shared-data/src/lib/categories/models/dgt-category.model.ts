import { DGTEntity } from '../../metadata/models/dgt-entity.model';
import { DGTCategoryField } from './dgt-category-field.model';

export interface DGTCategory extends DGTEntity {
    icon: string;
    description: string;
    fields: DGTCategoryField[];
    groupId: string;
}
