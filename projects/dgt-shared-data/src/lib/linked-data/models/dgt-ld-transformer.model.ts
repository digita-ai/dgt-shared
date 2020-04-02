import { Observable } from 'rxjs';
import { DGTLDEntity } from './dgt-ld-entity.model';

export interface DGTLDTransformer<T> {
    toDomain(entity: DGTLDEntity): Observable<T>;
    toTriples(object: T): Observable<DGTLDEntity[]>;
}
