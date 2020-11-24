import { Observable } from 'rxjs';
import { DGTLDResource } from './dgt-ld-resource.model';

export interface DGTLDTransformer<T> {
    toDomain(entities: DGTLDResource[]): Observable<T[]>;
    toTriples(objects: T[]): Observable<DGTLDResource[]>;
}
