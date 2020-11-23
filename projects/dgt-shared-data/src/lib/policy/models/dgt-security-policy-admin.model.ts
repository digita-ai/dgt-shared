import { DGTSecurityPolicyType } from './dgt-security-policy-type.model';
import { DGTSecurityPolicy } from './dgt-security-policy.model';

export interface DGTSecurityPolicyAdmin extends DGTSecurityPolicy {
    type: DGTSecurityPolicyType.ADMIN;
}
