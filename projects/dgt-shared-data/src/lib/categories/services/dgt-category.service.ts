import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTCategory } from '../models/dgt-category.model';

@DGTInjectable()
export abstract class DGTCategoryService implements DGTLDResourceService<DGTCategory> {
    public abstract get(id: string): Observable<DGTCategory>;
    public abstract query(filter?: DGTLDFilter): Observable<DGTCategory[]>;
    public abstract save<T extends DGTCategory>(resources: T[]): Observable<T[]>;
    public abstract delete(resource: DGTCategory): Observable<DGTCategory>;

}
