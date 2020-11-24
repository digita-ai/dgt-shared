import { Observable } from 'rxjs';
import { DGTProfile } from '../models/dgt-profile.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';

export abstract class DGTProfileService {
    public abstract get(exchange: DGTExchange): Observable<DGTProfile>;
    public abstract update(originalProfile: DGTProfile, updatedProfile: DGTProfile): Observable<DGTProfile>;
}
