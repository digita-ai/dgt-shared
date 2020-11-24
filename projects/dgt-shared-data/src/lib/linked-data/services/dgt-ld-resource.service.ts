import { Observable } from 'rxjs';
import { DGTLDResource } from '../models/dgt-ld-resource.model';

export interface DGTLDResourceService<T extends DGTLDResource> {
    get(id: string): Observable<T>;
    query(filter: Partial<T>): Observable<T[]>;
    save(resource: T): Observable<T>;
    delete(resource: T): Observable<T>;
}
