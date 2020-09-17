import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTPurpose } from '../models/dgt-purpose.model';

@Injectable()
export abstract class DGTPurposeService implements DGTLDResourceService<DGTPurpose> {
    public abstract get(purposeId: string): Observable<DGTPurpose>;
    public abstract query(filter: Partial<DGTPurpose>): Observable<DGTPurpose[]>;
    public abstract save(resource: DGTPurpose): Observable<DGTPurpose>;
    public abstract delete(resource: DGTPurpose): Observable<DGTPurpose>;
}
