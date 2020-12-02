import { Observable } from 'rxjs';
import { DGTConnection } from '../models/dgt-connection.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';

@DGTInjectable()
export abstract class DGTConnectionService implements DGTLDResourceService<DGTConnection<any>> {
    public abstract save<T extends DGTConnection<any>>(resources: T[]): Observable<T[]>;
    public abstract delete<T extends DGTConnection<any>>(resource: T): Observable<T>;
    public abstract get<T extends DGTConnection<any>>(id: string): Observable<T>;
    public abstract query<T extends DGTConnection<any>>(filter?: DGTLDFilter): Observable<T[]>;
    public abstract getConnectionsWithWebId<T extends DGTConnection<any>>(webId: string): Observable<T[]>;
    public abstract getConnectionForInvite(inviteId: string, sourceId: string): Observable<any>;
    public abstract sendTokensForInvite<T extends DGTConnection<any>>(inviteId: string, fragvalue: string): Observable<T>;
}
