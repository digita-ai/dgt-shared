
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTPurpose } from '../models/dgt-purpose.model';

@DGTInjectable()
export abstract class DGTPurposeService implements DGTLDResourceService<DGTPurpose> {
    public abstract get(purposeId: string): Observable<DGTPurpose>;
    public abstract query(filter?: DGTLDFilter): Observable<DGTPurpose[]>;
    public abstract save(resources: DGTPurpose[]): Observable<DGTPurpose[]>;
    public abstract delete(resource: DGTPurpose): Observable<DGTPurpose>;
}
