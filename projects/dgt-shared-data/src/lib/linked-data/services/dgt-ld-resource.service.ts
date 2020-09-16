import { Observable } from 'rxjs';
import { DGTEntity } from '../../metadata/models/dgt-entity.model';

export interface DGTLDResourceService<T extends DGTEntity> {
    get(id: string): Observable<T>;
    query(filter: Partial<T>): Observable<T[]>;
    save(resource: T): Observable<T>;
    delete(resource: T): Observable<T>;
}