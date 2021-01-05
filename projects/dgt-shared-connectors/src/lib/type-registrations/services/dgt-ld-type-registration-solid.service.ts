
import { DGTExchangeService, DGTLDTypeRegistrationTransformerService, DGTLDUtils, DGTProfile, DGTLDTypeRegistration, DGTLDResource, DGTExchange, DGTConnectionSolid } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationBaseWeb, DGTConfigurationService, DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTConnectorSolid } from '../../solid/connectors/dgt-source-solid.connector';

/** Service for managing typeRegistrations in Solid. */
@DGTInjectable()
export class DGTLDTypeRegistrationSolidService {
  constructor(
    private connector: DGTConnectorSolid,
    private transformer: DGTLDTypeRegistrationTransformerService,
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
    private utils: DGTLDUtils,
    private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
    private exchanges: DGTExchangeService,
  ) {
    super();
  }

  /**
   * Get all typeRegistrations from multiple files.
   * @param typeRegistrationFiles List of typeRegistration file uris.
   * @param connection Connection to retrieve the typeRegistrations from.
   * @param source Source to retrieve the typeRegistrations from.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of typeRegistrations.
   */
  

  /**
   * Registers/adds an typeRegistration to the SOLID-pod
   * @param profile Profile to add reference to.
   * @param typeRegistration TypeRegistration to be added to the pod.
   * @param connection Connection object to add the typeRegistration to.
   * @param source Source object to add the typeRegistration to.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of registered typeRegistration.
   */
  public registerForResources(predicate: string, resource: DGTLDResource, exchange: DGTExchange): Observable<DGTLDTypeRegistration[]> {
    this.logger.debug(DGTLDTypeRegistrationService.name, 'Preparing to register typeRegistration.', { typeRegistrations, predicate, resource, exchange });

    let res = of(null);

    this.paramChecker.checkParametersNotNull({ typeRegistrations, predicate, resource });

    const foundTypeRegistrations = typeRegistrations.filter(typeRegistration =>
      (!resource.uri || typeRegistration.instance === resource.uri) &&
      this.utils.same(typeRegistration.forClass, predicate),
    );
    this.logger.debug(DGTLDTypeRegistrationService.name, 'Found typeRegistrations.', { foundTypeRegistrations });

    if (resource.uri && (!foundTypeRegistrations || foundTypeRegistrations.length === 0)) {
      // uri exists, and corresponding type registration does not exist -> create type registration
      this.logger.debug(DGTLDTypeRegistrationService.name, 'Creating the relevant typeRegistration.', { foundTypeRegistrations, resource });

      const typeRegistrationsToBeAdded: DGTLDTypeRegistration = {
        forClass: predicate,
        instance: resource.uri,
        uri: null,
        triples: null,
        exchange: exchange.uri,
      };

      res = of({ typeRegistrationsToBeAdded, exchange })
        .pipe(
          switchMap(data => this.con)
          switchMap(data => this.connector.save<DGTLDTypeRegistration>([data.typeRegistrationsToBeAdded], this.transformer)
            .pipe(map(addedTypeRegistrations => ({
              ...data, addedTypeRegistrations,
            })))),
          tap(data => this.logger.debug(DGTLDTypeRegistrationSolidService.name, 'Added new typeRegistrations', data)),
          map(data => data.addedTypeRegistrations),
        );
    } else if (!resource.uri && foundTypeRegistrations && foundTypeRegistrations.length > 0) {
      // uri does not exist, but type registration exist -> set document uri based on type registration

      this.logger.debug(DGTLDTypeRegistrationService.name, 'Returning the relevant typeRegistration.', { foundTypeRegistrations, resource });

      res = of(foundTypeRegistrations);
    } else if (!resource.uri && (!foundTypeRegistrations || foundTypeRegistrations.length === 0)) {
      throw new DGTErrorNotImplemented();
      // uri does not exist, and type registration does not exist => create type registration based on defaults and set uri
      // this.logger.debug(DGTLDTypeRegistrationService.name, 'Creating the relevant typeRegistration...', { foundTypeRegistrations, resource });
      // res = this.register(predicate, profile, connection, source);
    }

    return res;
  }

  public registerMissingTypeRegistrations(typeRegistrations: DGTLDTypeRegistration[], exchange: DGTExchange): Observable<DGTLDTypeRegistration[]> {
    this.logger.debug(DGTLDTypeRegistrationService.name, 'Starting to add missing typeRegistration.', { typeRegistrations, exchange });

    return of({ typeRegistrations, exchange })
      .pipe(
        map(data => {
          const typeRegistrationsInConfig = this.config.get(c => c.typeRegistrations);
          // make list of predicates that have to be added to TypeIndex files
          const typeRegistrationsMissing: DGTLDTypeRegistration[] = Object.keys(typeRegistrationsInConfig).map(key => {
            // filter out typeRegistrations that are already on the state
            // no need to add those
            const regsAlreadyAdded = data.typeRegistrations.map(reg => reg.forClass);

            const predicate = regsAlreadyAdded.includes(key) ? null : key;

            const typeRegistrationsToBeAdded: DGTLDTypeRegistration = {
              forClass: predicate,
              instance: typeRegistrationsInConfig[key],
              uri: null,
              triples: null,
              exchange: exchange.uri,
            };

            return typeRegistrationsToBeAdded;
          })
            .filter(typeRegistrationsToBeAdded => typeRegistrationsToBeAdded !== null && typeRegistrationsToBeAdded.forClass !== null);

          return { ...data, typeRegistrationsMissing };
        }),
        switchMap(data => data.typeRegistrationsMissing && data.typeRegistrationsMissing.length > 0 ?
          this.register(data.typeRegistrationsMissing)
          :
          of([]),
        ),
      );
  }

  public register(typeRegistrations: DGTLDTypeRegistration[]): Observable<DGTLDTypeRegistration[]> {
    this.logger.debug(DGTLDTypeRegistrationService.name, 'Starting to register typeRegistration.', { typeRegistrations });

    return of({ typeRegistrations })
      .pipe(
        switchMap(data =>
          // add the typeRegistration to the TypeIndex file
          this.connector.save<DGTLDTypeRegistration>(typeRegistrations, this.transformer)
            .pipe(map(addedTypeRegistrations => ({
              ...data, addedTypeRegistrations,
            }))),
        ),
        tap(data => this.logger.debug(DGTLDTypeRegistrationSolidService.name, 'Added new typeRegistrations', data)),
        map(data => data.addedTypeRegistrations),
      );
  }
}
