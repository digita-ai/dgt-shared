import * as _ from 'lodash';
import { DGTParameterCheckerService, DGTMap, DGTLoggerService, DGTInjectable, DGTErrorArgument, DGTConfigurationService, DGTErrorConfig, DGTConfigurationBase } from '@digita-ai/dgt-shared-utils';
import { DGTSourceType } from '../../source/models/dgt-source-type.model';
import { Observable, forkJoin, of } from 'rxjs';
import { map, mergeMap, tap, catchError, switchMap } from 'rxjs/operators';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTPurposeService } from '../../purpose/services/dgt-purpose.service';
import { DGTConnector } from '../models/dgt-connector.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTProfileService } from '../../profile/services/dgt-profile.service';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTLDTypeRegistrationService } from '../../linked-data/services/dgt-ld-type-registration.service';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDFilterPartial } from '../../linked-data/models/dgt-ld-filter-partial.model';

@DGTInjectable()
export class DGTConnectorService {

  private connectors: DGTMap<DGTSourceType, DGTConnector<any, any>>;

  constructor(
    private logger: DGTLoggerService,
    private sources: DGTSourceService,
    private connections: DGTConnectionService,
    private paramChecker: DGTParameterCheckerService,
    private purposes: DGTPurposeService,
    private profiles: DGTProfileService,
    private config: DGTConfigurationService<DGTConfigurationBase>,
    private typeregistrationService: DGTLDTypeRegistrationService,
  ) { }

  public register(sourceType: DGTSourceType, connector: DGTConnector<any, any>) {
    this.paramChecker.checkParametersNotNull({ sourceType, connector });

    if (!this.connectors) {
      this.connectors = new DGTMap<DGTSourceType, DGTConnector<any, any>>();
    }

    this.connectors.set(sourceType, connector);
  }

  public get(sourceType: DGTSourceType) {
    if (!sourceType) {
      throw new DGTErrorArgument('Argument sourceType should be set.', sourceType);
    }

    return this.connectors.get(sourceType);
  }

  public save<T extends DGTLDResource>(exchange: DGTExchange, resources: T[]): Observable<T[]> {
    this.paramChecker.checkParametersNotNull({ exchange, triples: resources });

    return this.sources.get(exchange.source).pipe(
      map(source => ({ source })),
      // get connection
      mergeMap(data => this.connections.query({
        type: DGTLDFilterType.PARTIAL,
        partial: { holder: exchange.holder, source: data.source.uri }
      } as DGTLDFilterPartial)
        .pipe(
          tap(connection => this.logger.debug(DGTConnectorService.name, 'found connection for upstream', connection)),
          map(connection => connection.length > 0 ? connection : [null]),
          map(connection => ({ ...data, connection: connection[0] })),
        )),
      // check if connection is set
      map(data => {
        if (data.connection !== null) {
          return data;
        } else {
          this.logger.debug(DGTConnectorService.name, 'No connection was found for this upstreamSync');
          throw new DGTErrorArgument('No connection found for this upstreamSync', data.connection);
        }
      }),
      // get connector
      map(data => ({ ...data, connector: this.connectors.get(data.source.type) })),
      // get purpose
      mergeMap(data => this.purposes.get(exchange.purpose).pipe(
        map(purpose => ({ ...data, purpose })),
      )),
      // get profile to pass to upstreamsync
      mergeMap(data => data.source.type === DGTSourceType.SOLID ? this.profiles.get(exchange).pipe(
        map(profile => ({ ...data, profile }))
      ) : of({ ...data, profile: null })),
      mergeMap(data => {
        if (resources.length === 0) {
          this.logger.debug(DGTConnectorService.name, 'triples can not be an empty list');
          throw new DGTErrorArgument('triples can not be an empty list', resources);
        }
        return forkJoin(resources.map(resource => this.upstreamSync(
          data.connector, resource, data.connection, null, exchange, data.profile)
        )).pipe(map(resultFromUpstream => ({ ...data, resultFromUpstream })));
      }),
      map(data => _.flatten(data.resultFromUpstream)),
      // catch error if no connection found or triples was an empty list
      catchError(() => {
        return [resources];
      }),
    ) as Observable<T[]>;
  }

  public upstreamSync<T extends DGTLDResource>(
    connector: DGTConnector<any, any>,
    resource: T,
    connection: DGTConnection<any>,
    transformer: DGTLDTransformer<T>,
    exchange: DGTExchange,
    profile: DGTProfile,
  ): Observable<T> {
    this.logger.debug(DGTConnectorService.name, 'upstream syncing',
      { connector, resource, connection, transformer, exchange, profile });

    return this.calculateDocumentUri(resource, profile, connection).pipe(
      tap( prepared => this.logger.debug(DGTConnectorService.name, 'Calculated document uri for upstreamsync', {prepared, s: prepared.triples[0].subject})),
      switchMap(preparedDomainEntity => {
        // find possible existing values to determine add or update
        return connector.query(preparedDomainEntity.uri, exchange, transformer).pipe(
          tap( data => this.logger.debug(DGTConnectorService.name, `Existing values: ${data.length}`, data)),
          map(existingValues => ({ existingValues, domainEntity: preparedDomainEntity })),
          catchError(error => {
            throw new DGTErrorArgument('Error querying mssql', {error});
          }),
        );
      }),
      tap( data => this.logger.debug(DGTConnectorService.name, `Existing values: ${data.existingValues.length}`, data)),
      switchMap(data => {
        if (data.existingValues[0]) {
          const updatedResource = { original: data.existingValues[0], updated: data.domainEntity };
          this.logger.debug(DGTConnectorService.name, 'Updating value', { connector, updatedResource });
          return connector.update<T>([updatedResource], transformer).pipe(
            map(resources => resources[0]),
            catchError((error) => {
              this.logger.debug(DGTConnectorService.name, '[upstreamSync] error updating', { connector, updatedResource, error });
              return of(data.domainEntity);
            }),
          );
        } else {
          this.logger.debug(DGTConnectorService.name, 'adding value', { connector, resource });
          return connector.add<T>([resource], transformer).pipe(
            map(resources => resources[0]),
            catchError(() => {
              this.logger.debug(DGTConnectorService.name, '[upstreamSync] error adding', { connector, resource });
              return of(resource);
            }),
          );
        }
      }),
      catchError( error => {
        this.logger.debug(DGTConnectorService.name, 'Error in upstreamsync, no syncing done', { error , resource});
        return of(resource);
      }),
    );
  }

  public calculateDocumentUri<T extends DGTLDResource>(
    domainEntity: T,
    profile: DGTProfile,
    connection: DGTConnection<any>,
  ): Observable<T> {
    this.logger.debug(DGTConnectorService.name, 'Calculating document uri', {domainEntity, profile, connection});
    let missingTypeReg = false;
    // profile will only have a value when we have a solid source / connection
    if ( !profile ) {
      return of(domainEntity);
    }
    // find typeregistration in profile
    const typeRegFound = profile.typeRegistrations.filter(reg =>
      reg.forClass === domainEntity.triples[0].predicate
    );
    const origin = new URL(connection.configuration.webId).origin;
    if (typeRegFound.length > 0) {
      this.logger.debug(DGTConnectorService.name, 'Typeregistration found in profile', typeRegFound[0]);
      // typeregistration found in profile
      domainEntity.uri = typeRegFound[0].instance;
    } else {
      // check config for typeReg
      const typeRegsInConfig = this.config.get(c => c.typeRegistrations);
      const typeRegFoundInConfig = Object.keys(typeRegsInConfig).filter(key =>
        key === domainEntity.triples[0].predicate
      );
      if (typeRegFoundInConfig && typeRegFoundInConfig.length > 0) {
        this.logger.debug(DGTConnectorService.name, 'Typeregistration found in config', typeRegFoundInConfig[0]);
        // typeReg found in config
        missingTypeReg = true;
        domainEntity.uri = origin + typeRegsInConfig[typeRegFoundInConfig[0]];
      } else {
        this.logger.debug(DGTConnectorService.name, 'no Typeregistration found in config');
        // tslint:disable-next-line:max-line-length
        throw new DGTErrorConfig('No TypeRegistration was found in the config matching this predicate', domainEntity.triples[0].predicate);
      }
    }

    domainEntity.triples[0].subject.value = domainEntity.uri + '#';

    return of(domainEntity).pipe(
      switchMap(entity => {
        if (missingTypeReg) {
          return this.typeregistrationService.registerMissingTypeRegistrations(profile).pipe(
            map(() => entity),
          );
        } else {
          return of(entity);
        }
      })
    );
  }

  public query<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
    this.logger.debug(DGTConnectorService.name, 'Getting triples', { exchange });

    this.paramChecker.checkParametersNotNull({ exchange });

    return of({ exchange })
      .pipe(
        switchMap((data) => this.sources.get(data.exchange.source)
          .pipe(map(source => ({ source, ...data, connector: this.get(source.type) })))),
        switchMap(data => this.purposes.get(data.exchange.purpose)
          .pipe(map(purpose => ({ ...data, purpose })))),
        mergeMap(data => data.source.type === DGTSourceType.SOLID ? this.profiles.get(exchange).pipe(
          map(profile => ({ ...data, profile, typeRegistrations: profile && profile.typeRegistrations ? profile.typeRegistrations.filter(typeRegistration => data.purpose.predicates.includes(typeRegistration.forClass)) : [] }))
        ) : of({ ...data, profile: null, typeRegistrations: null})),
        switchMap(data => data.connector.query<T>(null, exchange, transformer)
          .pipe(map(resources => ({ ...data, resources })))),
        switchMap(data => (data.typeRegistrations && data.typeRegistrations.length > 0
          ? forkJoin(data.typeRegistrations.map(typeRegistration => data.connector.query<T>(typeRegistration.instance, exchange, transformer)))
          : of([[]])).pipe(
            map( (resourcesOfResources: T[]) =>
              ({ ...data, resources: [...data.resources, ..._.flatten(resourcesOfResources)] })
            )
          )
        ),
        map(data => {
          console.log('================', data);
          const newRes = data.resources.map((resource: T) => {
            return {
              ...resource,
              triples: resource.triples.filter( triple => data.purpose.predicates.includes( triple.predicate ) ),
            };
          });
          return { ...data, resources: newRes};
        }),
        tap(data => this.logger.debug(DGTConnectorService.name, 'Queried resources for exchange', data)),
        map(data => data.resources),
        // catchError(() => of([])),
      );
  }
}
