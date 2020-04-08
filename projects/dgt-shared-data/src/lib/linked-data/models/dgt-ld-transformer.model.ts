import { Observable } from 'rxjs';
import { DGTLDEntity } from './dgt-ld-entity.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';

export interface DGTLDTransformer<T> {
    toDomain(entities: DGTLDEntity[]): Observable<T[]>;
    toTriples(objects: T[], connection: DGTConnectionSolid): Observable<DGTLDEntity[]>;
}
