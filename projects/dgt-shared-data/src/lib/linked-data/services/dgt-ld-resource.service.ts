import { Observable } from 'rxjs';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';

export interface DGTLDResourceService<T extends DGTLDResource> {
    get(id: string): Observable<T>;
    query(filter?: DGTLDFilter): Observable<T[]>;
    save(resource: T): Observable<T>;
    delete(resource: T): Observable<T>;
}
