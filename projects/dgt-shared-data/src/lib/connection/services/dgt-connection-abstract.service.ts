import { Observable } from 'rxjs';
import { DGTConnection } from '../models/dgt-connection.model';
import { Injectable } from '@angular/core';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';

@Injectable()
export abstract class DGTConnectionService implements DGTLDResourceService<DGTConnection<any>> {
    public abstract save(resource: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract delete(resource: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract get(id: string): Observable<DGTConnection<any>>;
    public abstract query(filter: Partial<DGTConnection<any>>): Observable<DGTConnection<any>[]>;
    public abstract getConnectionsWithWebId(webId: string): Observable<DGTConnection<any>[]>;
}
