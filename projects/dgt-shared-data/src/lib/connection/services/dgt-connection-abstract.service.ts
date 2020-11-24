import { Observable } from 'rxjs';
import { DGTConnection } from '../models/dgt-connection.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';

@DGTInjectable()
export abstract class DGTConnectionService implements DGTLDResourceService<DGTConnection<any>> {
    public abstract save(resource: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract delete(resource: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract get(id: string): Observable<DGTConnection<any>>;
    public abstract query(filter: Partial<DGTConnection<any>>): Observable<DGTConnection<any>[]>;
    public abstract getConnectionsWithWebId(webId: string): Observable<DGTConnection<any>[]>;
    public abstract getConnectionForInvite(inviteId: string, sourceId: string): Observable<any>;
    public abstract sendTokensForInvite(inviteId: string, fragvalue: string): Observable<DGTConnection<any>>;
}
