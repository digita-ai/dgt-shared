import { Observable } from 'rxjs';
import { DGTConnection } from '../models/dgt-connection.model';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class DGTConnectionService {
    public abstract create(connection: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract getConnections(): Observable<Array<DGTConnection<any>>>;
    public abstract getConnection(connectionId: string): Observable<DGTConnection<any>>;
    public abstract updateConnection(connection: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract findConnection(holderId: string, sourceId: string): Observable<DGTConnection<any>>;
}
