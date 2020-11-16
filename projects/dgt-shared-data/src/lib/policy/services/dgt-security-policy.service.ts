import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTSecurityPolicy } from '../models/dgt-security-policy.model';

@Injectable()
export abstract class DGTSecurityPolicyService implements DGTLDResourceService<DGTSecurityPolicy> {
    public abstract get(id: string): Observable<DGTSecurityPolicy>;
    public abstract query<T extends DGTSecurityPolicy>(filter?: DGTLDFilter): Observable<T[]>;
    public abstract save(resource: DGTSecurityPolicy): Observable<DGTSecurityPolicy>;
    public abstract delete(resource: DGTSecurityPolicy): Observable<DGTSecurityPolicy>;
}
