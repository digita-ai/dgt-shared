import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTExchange extends DGTEntity {
    justification: string;
    subject: string;
    source: string;
    connection: string;
}
