import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DGTLDTypeRegistrationService } from './dgt-ld-type-registration.service';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';
import { DGTLDTypeRegistration } from '../models/dgt-ld-type-registration.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTErrorNotImplemented } from '@digita-ai/dgt-shared-utils';

@Injectable()
export class DGTLDTypeRegistrationMockService extends DGTLDTypeRegistrationService {
  typeRegistrations = [null];

  public all(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTLDTypeRegistration[]> {
    return of(this.typeRegistrations);
  }

  public registerForResources(predicate: string, resource: DGTLDResource, profile: DGTProfile, _connection: DGTConnectionSolid): Observable<DGTLDTypeRegistration[]> {
    this.typeRegistrations.push(null);
    return of([null]);
  }

  public registerMissingTypeRegistrations(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTLDTypeRegistration[]> {
    throw new DGTErrorNotImplemented();
  }

  public register(typeRegistrations: DGTLDTypeRegistration[], profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTLDTypeRegistration[]> {
    this.typeRegistrations.push(null);
    return of([null]);
  }
}
