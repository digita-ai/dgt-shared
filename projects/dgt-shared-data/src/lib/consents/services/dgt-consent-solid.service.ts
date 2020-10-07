
import { forkJoin, Observable, of } from 'rxjs';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTConsentService } from './dgt-consent.service';
import { DGTConsent } from '../models/dgt-consent.model';
import { DGTConsentTransformerService } from './dgt-consent-transformer.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { v4 } from 'uuid';
import _ from 'lodash';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';
import { DGTLDTypeRegistrationService } from '../../linked-data/services/dgt-ld-type-registration.service';
import { DGTSourceConnector } from '../../source/models/dgt-source-connector.model';
import { DGTSourceSolidConfiguration } from '../../source/models/dgt-source-solid-configuration.model';
import { DGTConnectionSolidConfiguration } from '../../connection/models/dgt-connection-solid-configuration.model';

@DGTInjectable()
/** Service used for working with DGTConsents */
export class DGTConsentSolidService extends DGTConsentService {

  private isCorrectTypeRegistration = (typeRegistration) => typeRegistration.forClass === 'http://digita.ai/voc/consents#consent';

  /**
   * Get all consents from multiple files.
   * @param files List of consent file uris.
   * @param connection Connection to retrieve the consents from.
   * @param source Source to retrieve the consents from.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of consents.
   */
  public getAll(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTConsent[]> {
    this.logger.debug(DGTConsentSolidService.name, 'Starting to get all consents', { profile, connection, source });
    this.paramChecker.checkParametersNotNull({ profile, connection, source });

    const files = profile.typeRegistrations.filter(this.isCorrectTypeRegistration).map(typeRegistration => typeRegistration.instance);

    this.logger.debug(DGTConsentSolidService.name, 'Filtered files', { files });

    return of({ profile, files, connection, source })
      .pipe(
        switchMap(data => forkJoin(data.files.map(file => this.connector.query<DGTConsent>(file, null, null, connection, source, this.transformer)))
          .pipe(map(consents => ({ ...data, consents: _.flatten(consents) })))),
        tap(data => this.logger.debug(DGTConsentSolidService.name, 'Finished querying for consents', { data })),
        map(data => data.consents)
      );
  }


  /**
   * Registers/adds an consent to the SOLID-pod
   * @param profile Profile to add reference to.
   * @param consent Consent to be added to the pod.
   * @param connection Connection object to add the consent to.
   * @param source Source object to add the consent to.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of registered consent.
   */
  public register(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid, purposeLabel: string): Observable<DGTConsent[]> {
    this.paramChecker.checkParametersNotNull({ connection, source, profile, purposeLabel });
    this.logger.debug(DGTConsentService.name, 'Preparing to register consent.', { profile, connection, source });

    let expirationDate = new Date();
    const year = expirationDate.getFullYear();
    const month = expirationDate.getMonth();
    const day = expirationDate.getDate();
    //TODO how long default ? Now 100 years - set expiry date to now to invalidate.
    expirationDate = new Date(year + 100, month, day);

    const resource: DGTConsent = {
      id: v4(),
      source: source.id,
      connection: connection.id,
      subject: null,
      documentUri: null,
      triples: null,
      createdAt: new Date(),
      expirationDate: expirationDate,
      purposeLabel: purposeLabel,
      controller: 'Vito.be'
    };

    return of({ resource, connection, source, profile })
      .pipe(
        switchMap(data => this.typeRegistrations.registerForResources('http://digita.ai/voc/consents#consent', data.resource, data.profile, data.connection, data.source)
          .pipe(map(typeRegistrations => ({ ...data, typeRegistrations, resource: ({ ...data.resource, documentUri: typeRegistrations[0].instance }) })))),
        switchMap(data => this.connector.add<DGTConsent>([data.resource], data.connection, data.source, this.transformer)
          .pipe(map(addedConsents => ({ ...data, addedConsents, })))),
        tap(data => this.logger.debug(DGTConsentSolidService.name, 'Added new consent', data)),
        map(data => data.addedConsents)
      );
  }

  public get(filter: Partial<DGTConsent>) {
    throw new Error('Method not implemented.');
  }
  public delete(resources: DGTConsent[], connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTConsent[]> {
    this.paramChecker.checkParametersNotNull({ resources, connection, source });
    this.logger.debug(DGTConsentSolidService.name, 'Preparing to remove consent.', { resources, connection });

    return of({ resources, connection, source })
      .pipe(
        switchMap(data => this.connector.delete(data.resources, data.connection, data.source, this.transformer)),
        map(data => resources)
      );
  }

  constructor(
    protected logger: DGTLoggerService,
    private typeRegistrations: DGTLDTypeRegistrationService,
    private connector: DGTSourceConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration>,
    private transformer: DGTConsentTransformerService,
    private paramChecker: DGTParameterCheckerService,
  ) {
    super();
  }


}
