import { DGTProfileService } from './dgt-profile.service';

import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTProfile } from '../models/dgt-profile.model';
import { Observable, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { DGTProfileTransformerService } from './dgt-profile-transformer.service';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';
import { DGTLDTypeRegistrationService } from '../../linked-data/services/dgt-ld-type-registration.service';
import { DGTSourceConnector } from '../../source/models/dgt-source-connector.model';

@DGTInjectable()
/** Service used for retrieving and updating a user's profile */
export class DGTProfileSolidService extends DGTProfileService {
  constructor(
    private connector: DGTSourceConnector<any, any>,
    private transformer: DGTProfileTransformerService,
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
    private typeRegistrations: DGTLDTypeRegistrationService
  ) {
    super();
  }

  /**
   * Returns a user's profile
   * @param connection connection to retrieve the profile information from
   * @param source source to retrieve the profile information from
   */
  public get(connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTProfile> {
    this.paramChecker.checkParametersNotNull({ connection, source });

    return of({ connection, source })
      .pipe(
        switchMap(data => this.connector.query<DGTProfile>
          (data.connection.configuration.webId, null, null, connection, source, this.transformer)
          .pipe(map(profiles => ({ ...data, profile: profiles[0] })))),
        switchMap(data => this.typeRegistrations.all(data.profile, data.connection, data.source)
          .pipe(map(typeRegistrations => ({ ...data, typeRegistrations, profile: ({ ...data.profile, typeRegistrations }) })))),
        tap(data => this.logger.debug(DGTProfileSolidService.name, 'Retrieved profile data', data)),
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
  public update(
    originalProfile: DGTProfile,
    updatedProfile: DGTProfile,
    connection: DGTConnectionSolid,
    source: DGTSourceSolid
  ): Observable<DGTProfile> {
    this.paramChecker.checkParametersNotNull({ originalProfile, updatedProfile, connection, source });

    return of({ originalProfile, updatedProfile, connection, source })
      .pipe(
        switchMap(data => this.connector.update(
          [{ original: data.originalProfile, updated: data.updatedProfile }],
          data.connection,
          data.source,
          this.transformer
        )
          .pipe(map(updates => updates[0]))
        ),
      )
  }
}
