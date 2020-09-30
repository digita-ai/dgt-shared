import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTConsent extends DGTLDResource {
    expirationDate: Date;
    purposeLabel: string;
    controller: string;
}
