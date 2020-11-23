import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export interface DGTSecurityCredential extends DGTLDResource {
    clientSecret: string;
    holder: string;
}
