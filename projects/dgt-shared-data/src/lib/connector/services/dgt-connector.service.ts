import * as _ from 'lodash';
import { DGTParameterCheckerService, DGTMap, DGTLoggerService, DGTInjectable, DGTErrorArgument, DGTConfigurationService, DGTConfigurationBase, DGTErrorConfig } from '@digita-ai/dgt-shared-utils';
import { DGTSourceType } from '../../source/models/dgt-source-type.model';
import { Observable, forkJoin, of } from 'rxjs';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { map, mergeMap, tap, catchError, switchMap } from 'rxjs/operators';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTPurposeService } from '../../purpose/services/dgt-purpose.service';
import { DGTConnector } from '../models/dgt-connector.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTProfileSolidService } from '../../profile/services/dgt-profile-solid.service';
import { DGTProfile } from '../../profile/models/dgt-profile.model';
import { DGTLDNode } from '../../linked-data/models/dgt-ld-node.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTypeRegistrationSolidService } from '../../linked-data/services/dgt-ld-type-registration-solid.service';
import { DGTLDTypeRegistration } from '../../linked-data/models/dgt-ld-type-registration.model';
import uuid from 'uuid';

@DGTInjectable()
export class DGTConnectorService {

  private connectors: DGTMap<DGTSourceType, DGTConnector<any, any>>;

  constructor(
    private logger: DGTLoggerService,
    private sources: DGTSourceService,
    private connections: DGTConnectionService,
    private paramChecker: DGTParameterCheckerService,
    private purposes: DGTPurposeService,
    private profilesSolid: DGTProfileSolidService,
    private config: DGTConfigurationService<DGTConfigurationBase>,
    private typeregistrationService: DGTLDTypeRegistrationSolidService,
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

  public save(exchange: DGTExchange, triples: DGTLDTriple[], destination: string): Observable<DGTLDTriple[]> {
    this.paramChecker.checkParametersNotNull({ exchange, triples });

    return this.sources.get(destination).pipe(
      map(source => ({ source })),
      // get connection
      mergeMap(data => this.connections.query({ holder: exchange.holder, source: data.source.id }).pipe(
        tap(connection => this.logger.debug(DGTConnectorService.name, 'found connection for upstream', connection)),
        map(connection => connection.length > 0 ? connection : [null]),
        map(connection => ({ ...data, connection: connection[0] })),
      )),
      // check if connection is set
      map(data => {
        if (data.connection !== null) {
          return data;
        } else {
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
      mergeMap(data => {
        if (data.source.type === DGTSourceType.SOLID) {
          return this.profilesSolid.get(data.connection, data.source).pipe(
            map(profile => ({ ...data, profile }))
          );
        } else {
          return of({ ...data, profile: null });
        }
      }),
      mergeMap(data => {
        if (triples.length === 0) {
          throw new DGTErrorArgument('triples can not be an empty list', triples);
        }
        return forkJoin(triples.map(triple => this.upstreamSync(
          data.connector,
          {
            ...triple,
            connection: exchange.connection,
            source: exchange.source,
            subject: null,
            documentUri: null,
            triples: [triple],                // which transformer do we use ???
          } as DGTLDResource, data.connection, data.source, null, data.purpose, exchange, data.profile)
        )).pipe(map(resultFromUpstream => ({ ...data, resultFromUpstream })));
      }),
      map(data => _.flatten(data.resultFromUpstream.map(res => res.triples))),
      // catch error if no connection found or triples was an empty list / any other error
      catchError( (error) => {
        this.logger.debug(DGTConnectorService.name, 'Error for this upstreamSync', error);
        return [triples];
      }),
    );
  }

  public upstreamSync<T extends DGTLDResource>(
    connector: DGTConnector<any, any>,
    domainEntity: T,
    connection: DGTConnection<any>,
    source: DGTSource<any>,
    transformer: DGTLDTransformer<T>,
    purpose: DGTPurpose,
    exchange: DGTExchange,
    profile: DGTProfile,
  ): Observable<T> {
    this.logger.debug(DGTConnectorService.name, 'upstream syncing',
      { connector, domainEntity, connection, source, transformer, purpose, exchange });

    return this.prepareDomainEntity(domainEntity, profile, source, connection).pipe(
      switchMap(preparedDomainEntity =>
        // find possible existing values to determine add or update
        connector.query(preparedDomainEntity.documentUri, purpose, exchange, connection, source, transformer).pipe(
          map( existingValues => ({ existingValues, domainEntity: preparedDomainEntity})),
        )
      ),
      switchMap(data => {
        if (data.existingValues[0]) {
          // convert to list of {original: Object, updated: Object}
          const updateDomainEntity = { original: data.existingValues[0], updated: data.domainEntity };
          this.logger.debug(DGTConnectorService.name, 'Updating value', { connector, updateDomainEntity });
          return connector.update([updateDomainEntity], connection, source, transformer).pipe(
            map(triples => triples[0]),
            catchError((error) => {
              this.logger.debug(DGTConnectorService.name, '[upstreamSync] error updating', { connector, updateDomainEntity, error });
              return of(data.domainEntity);
            }),
          );
        } else {
          this.logger.debug(DGTConnectorService.name, 'adding value', { connector, domainEntity: data.domainEntity });
          return connector.add([data.domainEntity], connection, source, transformer).pipe(
            map(triples => triples[0]),
            catchError((error) => {
              this.logger.debug(DGTConnectorService.name, '[upstreamSync] error adding', { connector, domainEntity: data.domainEntity, error });
              return of(data.domainEntity);
            }),
          );
        }
      }),
    );
  }

  public prepareDomainEntity<T extends DGTLDResource>(
    domainEntity: T,
    profile: DGTProfile,
    source: DGTSource<any>,
    connection: DGTConnection<any>,
  ): Observable<T> {
    console.log('===============', profile.typeRegistrations);
    let typeRegToAdd: DGTLDTypeRegistration = null;
    // profile will only have a value when we have a solid source / connection
    if (profile && source.type === DGTSourceType.SOLID) {
      // find typeregistration in profile
      const typeRegFound = profile.typeRegistrations.filter( reg =>
        reg.forClass === domainEntity.triples[0].predicate
      );
      const origin = new URL(connection.configuration.webId).origin;
      if (typeRegFound.length > 0) {
        this.logger.debug(DGTConnectorService.name, 'Typeregistration found in profile', typeRegFound[0]);
        // typeregistration found in profile
        domainEntity.documentUri = typeRegFound[0].instance;
      } else {
        // check config for typeReg
        const typeRegsInConfig = this.config.get( c => c.typeRegistrations);
        const typeRegFoundInConfig = Object.keys(typeRegsInConfig).filter(key =>
          key === domainEntity.triples[0].predicate
        );
        if ( typeRegFoundInConfig && typeRegFoundInConfig.length > 0) {
          this.logger.debug(DGTConnectorService.name, 'Typeregistration found in config', typeRegFoundInConfig[0]);
          // typeReg found in config
          typeRegToAdd = {
            forClass: domainEntity.triples[0].predicate,
            instance: typeRegsInConfig[typeRegFoundInConfig[0]],
            connection: connection.id,
            source: source.id,
            documentUri: profile.publicTypeIndex,
            triples: null,
            subject: null,
          } as DGTLDTypeRegistration;
          domainEntity.documentUri = origin + typeRegsInConfig[typeRegFoundInConfig[0]];
        } else {
          this.logger.debug(DGTConnectorService.name, 'no Typeregistration found in config');
          // tslint:disable-next-line:max-line-length
          throw new DGTErrorConfig('No TypeRegistration was found in the config matching this predicate', domainEntity.triples[0].predicate);
        }
      }
    } else {
      // not sure how important documentUri is when saving
      // to a source that is not a solid pod
      // this shouldnt matter, mssql worked fine with 'undefined'
      domainEntity.documentUri = connection.configuration.webId;
    }

    // Entities comming from e.g. MSSQL will not have a subject
    // Here we set it again
    if ( !domainEntity.subject ) {
      domainEntity.subject = {
        value: domainEntity.documentUri + '#' + uuid(),
        termType: DGTLDTermType.REFERENCE,
      } as DGTLDNode;
      domainEntity.triples[0].subject = domainEntity.subject;
    }

    return of(domainEntity).pipe(
      mergeMap( entity => {
        if (typeRegToAdd) {
          return this.typeregistrationService.register([typeRegToAdd], profile, connection, source).pipe(
            map( () => entity),
          );
        } else {
          return of(entity);
        }
      })
    );
  }

  public query(
    exchange: DGTExchange,
    connection: DGTConnection<any>,
    source: DGTSource<any>,
    purpose: DGTPurpose,
  ): Observable<DGTLDTriple[]> {
    this.logger.debug(DGTConnectorService.name, 'Getting triples', { exchange, connection, source, purpose });

    this.paramChecker.checkParametersNotNull({ exchange, connection, source, purpose });

    const connector: DGTConnector<any, any> = this.get(source.type);

    if (connector && source.type === DGTSourceType.SOLID) {
      return this.profilesSolid.get(connection, source).pipe(
        mergeMap(profile => {
          this.logger.debug(DGTConnectorService.name, 'Typeregistrations found', profile.typeRegistrations);
          if (profile.typeRegistrations.length > 0) {
            return forkJoin(profile.typeRegistrations.map(typereg => {
              if (purpose.predicates.includes(typereg.forClass)) {
                this.logger.debug(DGTConnectorService.name, 'getting values for TypeRegistration', typereg);
                return connector.query(typereg.instance, purpose, exchange, connection, source, null);
              } else {
                return of([] as DGTLDResource[]);
              }
            })).pipe(
              map(resources => _.flatten(resources)),
              map(resources => resources.map(resource => resource.triples)),
              map(triples => _.flatten(triples)),
              map(triples => [...triples, ...profile.triples])
            );
          } else {
            // of() is needed because the if above returns an Observable
            // and that Observable needs a mergeMap to function
            return of(profile.triples);
          }
        }),
        tap(triples => this.logger.debug(DGTConnectorService.name, `${triples.length} Triples before filtering predicate values`)),
        map(triples => triples.filter(triple => purpose.predicates.includes(triple.predicate))),
        tap(triples => this.logger.debug(DGTConnectorService.name, `${triples.length} Triples after filtering predicate values`)),
      );
    } else {
      return connector.query(null, purpose, exchange, connection, source, null)
        .pipe(
          map((entities) => entities.map(entity => entity.triples)),
          map((triples) => _.flatten(triples)),
          map(triples => triples.filter(triple => purpose.predicates.includes(triple.predicate))),
          catchError(() => of([])),
        );
    }
  }
}
