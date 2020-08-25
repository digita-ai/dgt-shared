import { DGTEntity } from '../../metadata/models/dgt-entity.model';
import { DGTLDFilter } from './dgt-ld-filter.model';

export interface DGTLD extends DGTEntity {
    icon: string;
    description: string;
    filters: DGTLDFilter[];
    groupId: string;
}
