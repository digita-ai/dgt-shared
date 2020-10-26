
import { forkJoin, Observable, of } from 'rxjs';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTConsentService } from './dgt-consent.service';
import { DGTConsent } from '../models/dgt-consent.model';
import { DGTConsentTransformerService } from './dgt-consent-transformer.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { v4 } from 'uuid';
import _ from 'lodash';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTLDTypeRegistrationService } from '../../linked-data/services/dgt-ld-type-registration.service';
import { DGTConnector } from '../../connector/models/dgt-connector.model';
import { DGTSourceSolidConfiguration } from '../../source/models/dgt-source-solid-configuration.model';
import { DGTConnectionSolidConfiguration } from '../../connection/models/dgt-connection-solid-configuration.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';

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
  public getAll(profile: DGTProfile): Observable<DGTConsent[]> {
    this.logger.debug(DGTConsentSolidService.name, 'Starting to get all consents', { profile });
    this.paramChecker.checkParametersNotNull({ profile });

    const files = profile.typeRegistrations.filter(this.isCorrectTypeRegistration).map(typeRegistration => typeRegistration.instance);

    this.logger.debug(DGTConsentSolidService.name, 'Filtered files', { files });

    return of({ profile, files })
      .pipe(
        switchMap(data => this.exchanges.get(profile.exchange)
          .pipe(map(exchange => ({ ...data, exchange })))),
        switchMap(data => forkJoin(data.files.map(file => this.connector.query<DGTConsent>(file, data.exchange, this.transformer)))
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
  public register(profile: DGTProfile, purposeLabel: string): Observable<DGTConsent[]> {
    this.paramChecker.checkParametersNotNull({ profile, purposeLabel });
    this.logger.debug(DGTConsentService.name, 'Preparing to register consent.', { profile });

    let expirationDate = new Date();
    const year = expirationDate.getFullYear();
    const month = expirationDate.getMonth();
    const day = expirationDate.getDate();
    //TODO how long default ? Now 100 years - set expiry date to now to invalidate.
    expirationDate = new Date(year + 100, month, day);

    const resource: DGTConsent = {
      id: v4(),
      documentUri: null,
      triples: null,
      createdAt: new Date(),
      expirationDate: expirationDate,
      purposeLabel: purposeLabel,
      controller: 'Vito.be',
      exchange: profile.exchange,
    };

    return of({ resource, profile })
      .pipe(
        switchMap(data => this.typeRegistrations.registerForResources('http://digita.ai/voc/consents#consent', data.resource, data.profile)
          .pipe(map(typeRegistrations => ({ ...data, typeRegistrations, resource: ({ ...data.resource, documentUri: typeRegistrations[0].instance }) })))),
        switchMap(data => this.connector.add<DGTConsent>([data.resource], this.transformer)
          .pipe(map(addedConsents => ({ ...data, addedConsents, })))),
        tap(data => this.logger.debug(DGTConsentSolidService.name, 'Added new consent', data)),
        map(data => data.addedConsents)
      );
  }

  public get(filter: Partial<DGTConsent>) {
    throw new Error('Method not implemented.');
  }
  public delete(resources: DGTConsent[]): Observable<DGTConsent[]> {
    this.paramChecker.checkParametersNotNull({ resources });
    this.logger.debug(DGTConsentSolidService.name, 'Preparing to remove consent.', { resources });

    return of({ resources })
      .pipe(
        switchMap(data => this.connector.delete(data.resources, this.transformer)),
        map(data => resources)
      );
  }

  constructor(
    protected logger: DGTLoggerService,
    private typeRegistrations: DGTLDTypeRegistrationService,
    private connector: DGTConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration>,
    private transformer: DGTConsentTransformerService,
    private paramChecker: DGTParameterCheckerService,
    private exchanges: DGTExchangeService,
  ) {
    super();
  }


}
