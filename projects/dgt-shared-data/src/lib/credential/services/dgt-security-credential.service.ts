import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTSecurityCredential } from '../models/dgt-security-credential.model';

@Injectable()
export abstract class DGTSecurityCredentialService implements DGTLDResourceService<DGTSecurityCredential> {
    public abstract get(id: string): Observable<DGTSecurityCredential>;
    public abstract query<T extends DGTSecurityCredential>(filter?: DGTLDFilter): Observable<T[]>;
    public abstract save(resource: DGTSecurityCredential): Observable<DGTSecurityCredential>;
    public abstract delete(resource: DGTSecurityCredential): Observable<DGTSecurityCredential>;
}
