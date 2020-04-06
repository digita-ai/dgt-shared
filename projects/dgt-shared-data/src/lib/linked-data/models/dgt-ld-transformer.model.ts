import { Observable } from 'rxjs';
import { DGTLDEntity } from './dgt-ld-entity.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';

export interface DGTLDTransformer<T> {
    toDomain(entity: DGTLDEntity): Observable<T>;
    toTriples(object: T, connection: DGTConnectionSolid): Observable<DGTLDEntity[]>;
}
