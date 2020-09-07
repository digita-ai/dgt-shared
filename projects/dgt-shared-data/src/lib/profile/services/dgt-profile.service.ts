import { Observable } from 'rxjs';
import { DGTProfile } from '../models/dgt-profile.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';

export abstract class DGTProfileService {
    public abstract get(connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTProfile>;
    public abstract update(
        originalProfile: DGTProfile,
        updatedProfile: DGTProfile,
        connection: DGTConnectionSolid,
        source: DGTSourceSolid
    ): Observable<DGTProfile>;
}
