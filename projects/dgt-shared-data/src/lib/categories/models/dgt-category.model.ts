import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTCategory extends DGTLDResource {
    icon: string;
    description: string;
    filter: DGTLDFilter;
    groupId: string;
}
