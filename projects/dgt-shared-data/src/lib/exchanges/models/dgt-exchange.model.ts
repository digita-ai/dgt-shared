import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTExchange extends DGTEntity {
    purpose: string;
    holder: string;
    source: string;
    connection: string;
}
