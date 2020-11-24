import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTExchange extends DGTLDResource {
    purpose: string;
    holder: string;
    source: string;
    connection: string;
}
