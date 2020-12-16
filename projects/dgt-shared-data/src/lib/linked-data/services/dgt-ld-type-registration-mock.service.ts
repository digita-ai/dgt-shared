
import { DGTErrorNotImplemented, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTypeRegistration } from '../models/dgt-ld-type-registration.model';
import { DGTLDTypeRegistrationService } from './dgt-ld-type-registration.service';

@DGTInjectable()
export class DGTLDTypeRegistrationMockService extends DGTLDTypeRegistrationService {
  typeRegistrations = [null];

  public all(profile: DGTProfile): Observable<DGTLDTypeRegistration[]> {
    return of(this.typeRegistrations);
  }

  public registerForResources(predicate: string, resource: DGTLDResource, profile: DGTProfile): Observable<DGTLDTypeRegistration[]> {
    this.typeRegistrations.push(null);
    return of([null]);
  }

  public registerMissingTypeRegistrations(profile: DGTProfile): Observable<DGTLDTypeRegistration[]> {
    throw new DGTErrorNotImplemented();
  }

  public register(typeRegistrations: DGTLDTypeRegistration[], profile: DGTProfile): Observable<DGTLDTypeRegistration[]> {
    this.typeRegistrations.push(null);
    return of([null]);
  }
}
