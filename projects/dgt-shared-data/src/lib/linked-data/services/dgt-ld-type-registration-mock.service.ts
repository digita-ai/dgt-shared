import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DGTLDTypeRegistrationService } from './dgt-ld-type-registration.service';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';
import { DGTLDTypeRegistration } from '../models/dgt-ld-type-registration.model';
import { DGTLDPredicate } from '../models/dgt-ld-predicate.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';

@Injectable()
export class DGTLDTypeRegistrationMockService extends DGTLDTypeRegistrationService {
  typeRegistrations = [null];

  public all(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTLDTypeRegistration[]> {
    return of(this.typeRegistrations);
  }

  public registerForResources(predicate: DGTLDPredicate, resource: DGTLDResource, profile: DGTProfile, _connection: DGTConnectionSolid): Observable<DGTLDTypeRegistration[]> {
    this.typeRegistrations.push(null);
    return of([null]);
  }
}
