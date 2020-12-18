import { Observable } from 'rxjs';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTProfile } from '../models/dgt-profile.model';

export abstract class DGTProfileService {
    public abstract get(exchange: DGTExchange): Observable<DGTProfile>;
    public abstract update(originalProfile: DGTProfile, updatedProfile: DGTProfile): Observable<DGTProfile>;
}
