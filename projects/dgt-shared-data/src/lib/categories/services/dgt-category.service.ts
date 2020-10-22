import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTCategory } from '../models/dgt-category.model';

@DGTInjectable()
export abstract class DGTCategoryService implements DGTLDResourceService<DGTCategory> {
    public abstract get(id: string): Observable<DGTCategory>;
    public abstract query(filter: Partial<DGTCategory>): Observable<DGTCategory[]>;
    public abstract save(resource: DGTCategory): Observable<DGTCategory>;
    public abstract delete(resource: DGTCategory): Observable<DGTCategory>;

}