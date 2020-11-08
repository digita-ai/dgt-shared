import { Observable } from 'rxjs';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTInvite } from '../models/dgt-invite.model';

@DGTInjectable()
export abstract class DGTInviteService implements DGTLDResourceService<DGTInvite> {
  public abstract get(id: string): Observable<DGTInvite>;
  public abstract query(filter: Partial<DGTInvite>): Observable<DGTInvite[]>;
  public abstract verify(inviteId: string): Observable<DGTInvite>;
  public abstract save(resource: DGTInvite): Observable<DGTInvite>;
  public abstract delete(resource: DGTInvite): Observable<DGTInvite>;
}