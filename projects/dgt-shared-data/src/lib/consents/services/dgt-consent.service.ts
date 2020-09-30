import { Observable } from 'rxjs';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';
import { DGTConsent } from '../models/dgt-consent.model';

/** Service for managing events. */
export abstract class DGTConsentService {
    public abstract delete(resources: DGTConsent[], connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTConsent[]>
    public abstract getAll(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTConsent[]>;
    public abstract register(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid, purposeLabel: string): Observable<DGTConsent[]>;

}
