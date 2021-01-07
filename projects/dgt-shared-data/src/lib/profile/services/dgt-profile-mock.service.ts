import { DGTErrorNotImplemented, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTProfile } from '../models/dgt-profile.model';
import { DGTProfileService } from './dgt-profile.service';

@DGTInjectable()
/** Service used for retrieving and updating a user's profile */
export class DGTProfileMockService extends DGTProfileService {
  constructor() {
    super();
  }

  /**
   * Returns a user's profile
   * @param connection connection to retrieve the profile information from
   * @param source source to retrieve the profile information from
   */
  public get(exchange: DGTExchange): Observable<DGTProfile> {
    throw new DGTErrorNotImplemented();
  }

  /**
   * Updates a user's profile
   * @param originalProfile the original profile
   * @param updatedProfile the updated profile
   * @param connection connection to retrieve the profile information from
   * @param source source to retrieve the profile information from
   */
  public update(resource: DGTProfile): Observable<DGTProfile> {
    throw new DGTErrorNotImplemented();
  }
}
