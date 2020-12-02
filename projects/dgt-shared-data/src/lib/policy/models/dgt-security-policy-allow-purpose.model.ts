import { DGTSecurityPolicyType } from './dgt-security-policy-type.model';
import { DGTSecurityPolicy } from './dgt-security-policy.model';

export interface DGTSecurityPolicyAllowPurpose extends DGTSecurityPolicy {
    type: DGTSecurityPolicyType.ALLOW_PURPOSE;
    purpose: string;
}
