import { Observable } from 'rxjs';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';

export interface DGTLDResourceService<T extends DGTLDResource> {
    /** Gets a single T */
    get(id: string): Observable<T>;
    /** Gets all T */
    query(filter?: DGTLDFilter): Observable<T[]>;
    /** Saves a list of T */
    save(resources: T[]): Observable<T[]>;
    /** Deletes a single T */
    delete(resource: T): Observable<T>;
}
