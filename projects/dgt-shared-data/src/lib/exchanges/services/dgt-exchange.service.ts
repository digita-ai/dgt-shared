import { Observable } from 'rxjs';

import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTInjectable } from '@digita/dgt-shared-utils';

@DGTInjectable()
export abstract class DGTExchangeService implements DGTLDResourceService<DGTExchange> {
    public abstract get(id: string): Observable<DGTExchange>;
    public abstract query(filter: Partial<DGTExchange>): Observable<DGTExchange[]>;
    public abstract save(resource: DGTExchange): Observable<DGTExchange>;
    public abstract delete(resource: DGTExchange): Observable<DGTExchange>;
}
