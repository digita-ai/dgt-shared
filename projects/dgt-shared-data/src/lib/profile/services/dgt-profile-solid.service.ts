import { DGTProfileService } from './dgt-profile.service';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTProfile } from '../models/dgt-profile.model';
import { Observable, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { DGTProfileTransformerService } from './dgt-profile-transformer.service';
import { DGTLDTypeRegistrationService } from '../../linked-data/services/dgt-ld-type-registration.service';
import { DGTConnector } from '../../connector/models/dgt-connector.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';

@DGTInjectable()
/** Service used for retrieving and updating a user's profile */
export class DGTProfileSolidService extends DGTProfileService {
  constructor(
    private connector: DGTConnector<any, any>,
    private transformer: DGTProfileTransformerService,
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
    private typeRegistrations: DGTLDTypeRegistrationService,
    private connections: DGTConnectionService,
  ) {
    super();
  }

  /**
   * Returns a user's profile
   * @param connection connection to retrieve the profile information from
   * @param source source to retrieve the profile information from
   */
  public get(exchange: DGTExchange): Observable<DGTProfile> {
    this.logger.debug(DGTProfileSolidService.name, 'Starting to retrieve profile', { exchange })

    this.paramChecker.checkParametersNotNull({ exchange });

    return of({ exchange })
      .pipe(
        switchMap(data => this.connections.get(exchange.connection)
          .pipe(map(connection => ({ ...data, connection })))),
        switchMap(data => this.connector.query<DGTProfile>(data.connection.configuration.webId, data.exchange, this.transformer)
          .pipe(map(profiles => ({ ...data, profile: profiles[0] })))),
        tap(data => this.logger.debug(DGTProfileSolidService.name, 'Retrieved profile data', data)),
        switchMap(data => this.typeRegistrations.all(data.profile)
          .pipe(map(typeRegistrations => ({ ...data, typeRegistrations, profile: ({ ...data.profile, typeRegistrations }) })))),
        tap(data => this.logger.debug(DGTProfileSolidService.name, 'Retrieved type registrations for profile', data)),
        map(data => data.profile)
      );
  }

  /**
   * Updates a user's profile
   * @param originalProfile the original profile
   * @param updatedProfile the updated profile
   * @param connection connection to retrieve the profile information from
   * @param source source to retrieve the profile information from
   */
  public update(originalProfile: DGTProfile, updatedProfile: DGTProfile): Observable<DGTProfile> {
    this.paramChecker.checkParametersNotNull({ originalProfile, updatedProfile });

    return of({ originalProfile, updatedProfile })
      .pipe(
        switchMap(data => this.connector.update([{ original: data.originalProfile, updated: data.updatedProfile }], this.transformer)
          .pipe(map(updates => updates[0]))
        ),
      );
  }
}
