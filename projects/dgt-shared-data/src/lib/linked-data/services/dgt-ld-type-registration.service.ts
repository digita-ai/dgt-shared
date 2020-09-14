import { Observable } from 'rxjs';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTLDTypeRegistration } from '../models/dgt-ld-type-registration.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTLDPredicate } from '../models/dgt-ld-predicate.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';

/** Service for managing typeRegistrations. */
export abstract class DGTLDTypeRegistrationService {
    public abstract all(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTLDTypeRegistration[]>;
    public abstract registerForResources(predicate: DGTLDPredicate, resource: DGTLDResource, profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTLDTypeRegistration[]>;
}
