import { Observable } from 'rxjs';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTConsent } from '../models/dgt-consent.model';

/** Service for managing events. */
export abstract class DGTConsentService {
    public abstract delete(resources: DGTConsent[]): Observable<DGTConsent[]>
    public abstract getAll(profile: DGTProfile): Observable<DGTConsent[]>;
    public abstract register(profile: DGTProfile, purposeLabel: string): Observable<DGTConsent[]>;

}
