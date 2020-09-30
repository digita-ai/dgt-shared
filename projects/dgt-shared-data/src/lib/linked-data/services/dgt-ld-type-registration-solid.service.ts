import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { DGTLoggerService, DGTParameterCheckerService, DGTConfigurationService, DGTErrorNotImplemented } from '@digita/dgt-shared-utils';
import { DGTLDTypeRegistrationTransformerService } from './dgt-ld-type-registration-transformer.service';
import { DGTLDTypeRegistrationService } from './dgt-ld-type-registration.service';
import * as _ from 'lodash';
import { DGTLDUtils } from './dgt-ld-utils.service';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';
import { DGTLDTypeRegistration } from '../models/dgt-ld-type-registration.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTSourceConnector } from '../../source/models/dgt-source-connector.model';
import { DGTConfigurationBaseWeb } from '../../configuration/models/dgt-configuration-base-web.model';

/** Service for managing typeRegistrations in Solid. */
@Injectable()
export class DGTLDTypeRegistrationSolidService extends DGTLDTypeRegistrationService {
  constructor(
    private connector: DGTSourceConnector<any, any>,
    private transformer: DGTLDTypeRegistrationTransformerService,
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
    private utils: DGTLDUtils,
    private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
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
  public all(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTLDTypeRegistration[]> {
    this.paramChecker.checkParametersNotNull({ profile, connection, source });

    return of({ profile, connection, source })
      .pipe(
        switchMap(data => forkJoin([
          this.connector.query<DGTLDTypeRegistration>(data.profile.publicTypeIndex, null, null, connection, source, this.transformer),
          this.connector.query<DGTLDTypeRegistration>(data.profile.privateTypeIndex, null, null, connection, source, this.transformer),
        ])
          .pipe(map(typeRegistrations => ({ ...data, typeRegistrations: _.flatten(typeRegistrations) })))),
        map(data => data.typeRegistrations)
      );
  }

  /**
   * Registers/adds an typeRegistration to the SOLID-pod
   * @param profile Profile to add reference to.
   * @param typeRegistration TypeRegistration to be added to the pod.
   * @param connection Connection object to add the typeRegistration to.
   * @param source Source object to add the typeRegistration to.
   * @throws DGTErrorArgument when arguments are incorrect.
   * @returns Observable of registered typeRegistration.
   */
  public registerForResources(predicate: string, resource: DGTLDResource, profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTLDTypeRegistration[]> {
    this.logger.debug(DGTLDTypeRegistrationService.name, 'Preparing to register typeRegistration.', { profile, connection, source, predicate, resource });

    let res = of(null);

    this.paramChecker.checkParametersNotNull({ profile, connection, source, predicate, resource });

    const foundTypeRegistrations = profile.typeRegistrations.filter(typeRegistration =>
      (!resource.documentUri || typeRegistration.instance === resource.documentUri) &&
      this.utils.same(typeRegistration.forClass, predicate)
    );
    this.logger.debug(DGTLDTypeRegistrationService.name, 'Found typeRegistrations.', { foundTypeRegistrations });

    if (resource.documentUri && (!foundTypeRegistrations || foundTypeRegistrations.length === 0)) {
      // documenturi exists, and corresponding type registration does not exist -> create type registration
      this.logger.debug(DGTLDTypeRegistrationService.name, 'Creating the relevant typeRegistration.', { foundTypeRegistrations, resource });

      const typeRegistrationsToBeAdded: DGTLDTypeRegistration = {
        forClass: predicate,
        instance: resource.documentUri,
        connection: connection.id,
        source: source.id,
        documentUri: profile.privateTypeIndex,
        triples: null,
        subject: null
      };

      res = of({ typeRegistrationsToBeAdded, connection, source, profile })
        .pipe(
          switchMap(data => this.connector.add<DGTLDTypeRegistration>([data.typeRegistrationsToBeAdded], data.connection, data.source, this.transformer)
            .pipe(map(addedTypeRegistrations => ({
              ...data, addedTypeRegistrations,
            })))),
          tap(data => this.logger.debug(DGTLDTypeRegistrationSolidService.name, 'Added new typeRegistrations', data)),
          map(data => data.addedTypeRegistrations)
        );
    } else if (!resource.documentUri && foundTypeRegistrations && foundTypeRegistrations.length > 0) {
      // documenturi does not exist, but type registration exist -> set document uri based on type registration

      this.logger.debug(DGTLDTypeRegistrationService.name, 'Returning the relevant typeRegistration.', { foundTypeRegistrations, resource });

      res = of(foundTypeRegistrations);
    } else if (!resource.documentUri && (!foundTypeRegistrations || foundTypeRegistrations.length === 0)) {
      throw new DGTErrorNotImplemented();
      // documenturi does not exist, and type registration does not exist => create type registration based on defaults and set documenturi
      // this.logger.debug(DGTLDTypeRegistrationService.name, 'Creating the relevant typeRegistration...', { foundTypeRegistrations, resource });
      // res = this.register(predicate, profile, connection, source);
    }

    return res;
  }

  public registerMissingTypeRegistrations(profile: DGTProfile, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTLDTypeRegistration[]> {
    return of({ profile, connection, source })
      .pipe(
        map(data => {
          const typeRegistrationsInConfig = this.config.get(c => c.typeRegistrations);
          // make list of predicates that have to be added to TypeIndex files
          const typeRegistrationsMissing: DGTLDTypeRegistration[] = Object.keys(typeRegistrationsInConfig).map(key => {
            // filter out typeRegistrations that are already on the state
            // no need to add those
            const regsAlreadyAdded = data.profile.typeRegistrations.map(reg => reg.forClass);

            const predicate = regsAlreadyAdded.includes(key) ? null : `${key}#`;

            const typeRegistrationsToBeAdded: DGTLDTypeRegistration = {
              forClass: predicate,
              instance: typeRegistrationsInConfig[key],
              connection: connection.id,
              source: source.id,
              documentUri: profile.privateTypeIndex,
              triples: null,
              subject: null
            };

            return typeRegistrationsToBeAdded;
          })
            .filter(typeRegistrationsToBeAdded => typeRegistrationsToBeAdded !== null && typeRegistrationsToBeAdded.forClass !== null);

          return { ...data, typeRegistrationsMissing };
        }),
        switchMap(data => data.typeRegistrationsMissing && data.typeRegistrationsMissing.length > 0 ?
          this.register(data.typeRegistrationsMissing, data.profile, data.connection, data.source)
            .pipe(map(typeRegistrationsRegistered => _.flatten(typeRegistrationsRegistered).map(reg => ({ ...reg, instance: new URL(data.profile.documentUri).origin + reg.instance }))))
          :
          of([])
        ),
      );
  }

  public register(
    typeRegistrations: DGTLDTypeRegistration[],
    profile: DGTProfile,
    connection: DGTConnectionSolid,
    source: DGTSourceSolid,
  ): Observable<DGTLDTypeRegistration[]> {
    

    return of({ typeRegistrations, connection, source, profile })
      .pipe(
        switchMap(data =>
          // add the typeRegistration to the TypeIndex file
          this.connector.add<DGTLDTypeRegistration>(typeRegistrations, data.connection, data.source, this.transformer)
            .pipe(map(addedTypeRegistrations => ({
              ...data, addedTypeRegistrations,
            })))
        ),
        tap(data => this.logger.debug(DGTLDTypeRegistrationSolidService.name, 'Added new typeRegistrations', data)),
        map(data => data.addedTypeRegistrations)
      );
  }
}
