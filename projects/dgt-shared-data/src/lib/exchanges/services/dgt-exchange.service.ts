import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTExchange } from '../models/dgt-exchange.model';

@DGTInjectable()
export abstract class DGTExchangeService implements DGTLDResourceService<DGTExchange> {
    public abstract get(id: string): Observable<DGTExchange>;
    public abstract query(filter?: DGTLDFilter): Observable<DGTExchange[]>;
    public abstract save(exchanges: DGTExchange[]): Observable<DGTExchange[]>;
    public abstract delete(exchange: DGTExchange): Observable<DGTExchange>;
}
