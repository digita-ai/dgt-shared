import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTDataGroup } from '../models/data-group.model';

@DGTInjectable()
export abstract class DGTGroupService implements DGTLDResourceService<DGTDataGroup> {
    public abstract get(id: string): Observable<DGTDataGroup>;
    public abstract query(filter?: DGTLDFilter): Observable<DGTDataGroup[]>;
    public abstract save<T extends DGTDataGroup>(resources: T[]): Observable<T[]>;
    public abstract delete(resource: DGTDataGroup): Observable<DGTDataGroup>;

}
