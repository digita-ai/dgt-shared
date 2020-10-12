import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTHolder } from '../models/dgt-holder.model';

@DGTInjectable()
export abstract class DGTHolderService implements DGTLDResourceService<DGTHolder> {
  public abstract get(id: string): Observable<DGTHolder>;
  public abstract query(filter: Partial<DGTHolder>): Observable<DGTHolder[]>;
  public abstract save(resource: DGTHolder): Observable<DGTHolder>;
  public abstract delete(resource: DGTHolder): Observable<DGTHolder>;
}
