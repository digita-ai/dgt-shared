import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTCategory extends DGTEntity {
    icon: string;
    description: string;
    filter: DGTLDFilter;
    groupId: string;
}
