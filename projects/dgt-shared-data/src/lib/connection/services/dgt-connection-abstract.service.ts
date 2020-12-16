import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTConnection } from '../models/dgt-connection.model';

@DGTInjectable()
export abstract class DGTConnectionService implements DGTLDResourceService<DGTConnection<any>> {
    public abstract save(resources: DGTConnection<any>[]): Observable<DGTConnection<any>[]>;
    public abstract delete(resource: DGTConnection<any>): Observable<DGTConnection<any>>;
    public abstract get(id: string): Observable<DGTConnection<any>>;
    public abstract query(filter?: DGTLDFilter): Observable<DGTConnection<any>[]>;
    public abstract getConnectionsWithWebId(webId: string): Observable<DGTConnection<any>[]>;
    public abstract getConnectionForInvite(inviteId: string, sourceId: string): Observable<any>;
    public abstract sendTokensForInvite(inviteId: string, fragvalue: string): Observable<DGTConnection<any>>;
}
