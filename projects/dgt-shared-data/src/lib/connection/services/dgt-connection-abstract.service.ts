import { Observable } from 'rxjs';
import { DGTConnection } from '../models/dgt-connection.model';
import { Injectable } from '@angular/core';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';

@Injectable()
<<<<<<< Updated upstream
export abstract class DGTConnectionService implements DGTLDResourceService<DGTConnection<any>> {
    public abstract save(resource: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract delete(resource: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract get(id: string): Observable<DGTConnection<any>>;
    public abstract query(filter: Partial<DGTConnection<any>>): Observable<DGTConnection<any>[]>;
=======
export abstract class DGTConnectionService {
    public abstract create(connection: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract getConnections(): Observable<Array<DGTConnection<any>>>;
    public abstract getConnection(connectionId: string): Observable<DGTConnection<any>>;
    public abstract updateConnection(connection: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract findConnection(holderId: string, sourceId: string): Observable<DGTConnection<any>>;
    public abstract getConnectionsWithWebId(webId: string): Observable<DGTConnection<any>[]>;
>>>>>>> Stashed changes
}
