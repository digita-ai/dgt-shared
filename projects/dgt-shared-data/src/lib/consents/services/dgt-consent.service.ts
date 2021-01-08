import { Observable } from 'rxjs';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTConsent } from '../models/dgt-consent.model';

/** Service for managing events. */
export abstract class DGTConsentService {
    public abstract delete(resources: DGTConsent[]): Observable<DGTConsent[]>
    public abstract getAll(exchange: DGTExchange): Observable<DGTConsent[]>;
    public abstract register(resource: DGTConsent): Observable<DGTConsent[]>;
}
