import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTConsent extends DGTLDResource {
    createdAt: Date;
    expirationDate: Date;
    purposeLabel: string;
    controller: string;
}
