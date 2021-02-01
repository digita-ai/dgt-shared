import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTHolder } from '../models/dgt-holder.model';

@DGTInjectable()
export abstract class DGTHolderService implements DGTLDResourceService<DGTHolder> {
    public abstract get(id: string): Observable<DGTHolder>;
    public abstract query(filter?: DGTLDFilter): Observable<DGTHolder[]>;
    public abstract save(resources: DGTHolder[]): Observable<DGTHolder[]>;
    public abstract delete(resource: DGTHolder): Observable<DGTHolder>;
    public abstract merge(mainHolder: DGTHolder, otherHolders: DGTHolder[]): Observable<DGTHolder>;
    public abstract refresh(holder: DGTHolder): Observable<DGTLDResource[]>;
}
