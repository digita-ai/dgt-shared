
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTConnectionSolidConfiguration } from '../../connection/models/dgt-connection-solid-configuration.model';
import { DGTConnector } from '../../connector/models/dgt-connector.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTSourceSolidConfiguration } from '../../source/models/dgt-source-solid-configuration.model';
import { DGTConsent } from '../models/dgt-consent.model';
import { DGTConsentTransformerService } from './dgt-consent-transformer.service';
import { DGTConsentService } from './dgt-consent.service';

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
  public getAll(exchange: DGTExchange): Observable<DGTConsent[]> {
    this.logger.debug(DGTConsentSolidService.name, 'Starting to get all consents', { exchange });
    this.paramChecker.checkParametersNotNull({ exchange });

    // const files = profile.typeRegistrations.filter(this.isCorrectTypeRegistration).map(typeRegistration => typeRegistration.instance);

    // this.logger.debug(DGTConsentSolidService.name, 'Filtered files', { files });

    return of({ exchange })
      .pipe(
        switchMap(data => this.connector.query<DGTConsent>(data.exchange, this.transformer)
          .pipe(map(consents => ({ ...data, consents })))),
        tap(data => this.logger.debug(DGTConsentSolidService.name, 'Finished querying for consents', { data })),
        map(data => data.consents),
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
  public register(resource: DGTConsent): Observable<DGTConsent[]> {
    this.logger.debug(DGTConsentService.name, 'Preparing to register consent.', { resource });

    this.paramChecker.checkParametersNotNull({ resource });

    return of({ resource })
      .pipe(
        switchMap(data => this.connector.save<DGTConsent>([data.resource], this.transformer)
          .pipe(map(addedConsents => ({ ...data, addedConsents })))),
        tap(data => this.logger.debug(DGTConsentSolidService.name, 'Added new consent', data)),
        map(data => data.addedConsents),
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
        map(data => resources),
      );
  }

  constructor(
    protected logger: DGTLoggerService,
    private connector: DGTConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration>,
    private transformer: DGTConsentTransformerService,
    private paramChecker: DGTParameterCheckerService,
  ) {
    super();
  }

}
