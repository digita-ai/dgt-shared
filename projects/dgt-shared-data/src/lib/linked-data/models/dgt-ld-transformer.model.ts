import { Observable } from 'rxjs';
import { DGTLDResource } from './dgt-ld-resource.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';

export interface DGTLDTransformer<T> {
    toDomain(entities: DGTLDResource[]): Observable<T[]>;
    toTriples(objects: T[], connection: DGTConnectionSolid): Observable<DGTLDResource[]>;
}
