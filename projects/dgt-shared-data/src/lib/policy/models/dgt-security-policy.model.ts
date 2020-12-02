import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTSecurityPolicyType } from './dgt-security-policy-type.model';

export interface DGTSecurityPolicy extends DGTLDResource {
    type: DGTSecurityPolicyType;
    holder: string;
}
