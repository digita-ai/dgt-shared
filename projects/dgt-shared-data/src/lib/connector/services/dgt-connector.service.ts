import {
    DGTErrorArgument,
    DGTInjectable,
    DGTLoggerService,
    DGTMap,
    DGTParameterCheckerService,
} from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTPurposeService } from '../../purpose/services/dgt-purpose.service';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { DGTConnector } from '../models/dgt-connector.model';

@DGTInjectable()
export class DGTConnectorService {
    private connectors: DGTMap<string, DGTConnector<any, any>>;

    constructor(
        private logger: DGTLoggerService,
        private sources: DGTSourceService,
        private connections: DGTConnectionService,
        private paramChecker: DGTParameterCheckerService,
        private purposes: DGTPurposeService,
    ) {}

    public register(sourceType: string, connector: DGTConnector<any, any>) {
        this.paramChecker.checkParametersNotNull({ sourceType, connector });

        if (!this.connectors) {
            this.connectors = new DGTMap<string, DGTConnector<any, any>>();
        }

        this.connectors.set(sourceType, connector);
    }

    public get(sourceType: string) {
        if (!sourceType) {
            throw new DGTErrorArgument('Argument sourceType should be set.', sourceType);
        }

        return this.connectors.get(sourceType);
    }

    public save<T extends DGTLDResource>(
        exchange: DGTExchange,
        resources: T[],
        transformer: DGTLDTransformer<T>,
    ): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ exchange, triples: resources });

        return of({ exchange, resources, transformer }).pipe(
            switchMap((data) =>
                this.sources
                    .get(data.exchange.source)
                    .pipe(map((source) => ({ ...data, source, connector: this.connectors.get(source.type) }))),
            ),
            switchMap((data) =>
                this.connections.get(data.exchange.connection).pipe(map((connection) => ({ ...data, connection }))),
            ),
            mergeMap((data) => this.purposes.get(exchange.purpose).pipe(map((purpose) => ({ ...data, purpose })))),
            mergeMap((data) =>
                this.get(data.source.type)
                    .save<T>(data.resources, data.transformer)
                    .pipe(map((savedResources) => ({ ...data, resources: savedResources }))),
            ),
            catchError(() => {
                return [resources];
            }),
        ) as Observable<T[]>;
    }

    // public upstreamSync<T extends DGTLDResource>(
    //   connector: DGTConnector<any, any>,
    //   resource: T,
    //   connection: DGTConnection<any>,
    //   transformer: DGTLDTransformer<T>,
    //   exchange: DGTExchange,
    //   profile: DGTProfile,
    // ): Observable<T> {
    //   this.logger.debug(DGTConnectorService.name, 'upstream syncing',
    //     { connector, resource, connection, transformer, exchange, profile });

    //   return this.calculateDocumentUri(resource, profile, connection).pipe(
    //     tap(prepared => this.logger.debug(DGTConnectorService.name, 'Calculated document uri for upstreamsync', { prepared, s: prepared.triples[0].subject })),
    //     switchMap(preparedDomainEntity => {
    //       // find possible existing values to determine add or update
    //       return connector.query(exchange, transformer).pipe(
    //         map(existingValues => existingValues[0]),
    //         map(existingValue => ({ ...existingValue, triples: [existingValue.triples.find(t => t.predicate === preparedDomainEntity.triples[0].predicate)] })),
    //         map(existingValue => ({ existingValue: existingValue.triples[0] ? existingValue : null, domainEntity: preparedDomainEntity })),
    //         catchError(error => {
    //           this.logger.debug(DGTConnectorService.name, 'Error occured in upstreamsync', { error, resource });
    //           throw new DGTErrorArgument('Error querying', { error });
    //         }),
    //       );
    //     }),
    //     tap(data => this.logger.debug(DGTConnectorService.name, `Existing value: ${data.existingValue}`, { data })),
    //     switchMap(data => {
    //       if (data.existingValue) {
    //         data.domainEntity.triples[0].subject.value = data.existingValue.triples[0].subject.value;
    //         const updatedResource = { original: data.existingValue, updated: data.domainEntity };
    //         this.logger.debug(DGTConnectorService.name, 'Updating value', { connector, updatedResource });
    //         return connector.update<T>([updatedResource], transformer).pipe(
    //           map(resources => resources[0]),
    //           catchError((error) => {
    //             this.logger.debug(DGTConnectorService.name, '[upstreamSync] error updating', { connector, updatedResource, error });
    //             return of(data.domainEntity);
    //           }),
    //         );
    //       } else {
    //         this.logger.debug(DGTConnectorService.name, 'adding value', { connector, resource });
    //         return connector.add<T>([resource], transformer).pipe(
    //           map(resources => resources[0]),
    //           catchError((error) => {
    //             this.logger.debug(DGTConnectorService.name, '[upstreamSync] error adding', { connector, resource, error });
    //             return of(resource);
    //           }),
    //         );
    //       }
    //     }),
    //     catchError(error => {
    //       this.logger.debug(DGTConnectorService.name, 'Error in upstreamsync, no syncing done', { error, resource });
    //       return of(resource);
    //     }),
    //   );
    // }

    // public calculateDocumentUri<T extends DGTLDResource>(
    //   domainEntity: T,
    //   profile: DGTProfile,
    //   connection: DGTConnection<any>,
    // ): Observable<T> {
    //   this.logger.debug(DGTConnectorService.name, 'Calculating document uri', { domainEntity, profile, connection });
    //   let missingTypeReg = false;
    //   // profile will only have a value when we have a solid source / connection
    //   if (!profile) {
    //     return of(domainEntity);
    //   }
    //   // find typeregistration in profile
    //   const typeRegFound = profile.typeRegistrations.filter(reg =>
    //     reg.forClass === domainEntity.triples[0].predicate
    //   );
    //   const origin = new URL(connection.configuration.webId).origin;
    //   if (typeRegFound.length > 0) {
    //     this.logger.debug(DGTConnectorService.name, 'Typeregistration found in profile', typeRegFound[0]);
    //     // typeregistration found in profile
    //     domainEntity.uri = typeRegFound[0].instance;
    //   } else {
    //     // check config for typeReg
    //     const typeRegsInConfig = this.config.get(c => c.typeRegistrations);
    //     const typeRegFoundInConfig = Object.keys(typeRegsInConfig).filter(key =>
    //       key === domainEntity.triples[0].predicate
    //     );
    //     if (typeRegFoundInConfig && typeRegFoundInConfig.length > 0) {
    //       this.logger.debug(DGTConnectorService.name, 'Typeregistration found in config', typeRegFoundInConfig[0]);
    //       // typeReg found in config
    //       missingTypeReg = true;
    //       domainEntity.uri = origin + typeRegsInConfig[typeRegFoundInConfig[0]];
    //     } else {
    //       this.logger.debug(DGTConnectorService.name, 'no Typeregistration found in config');
    //       // tslint:disable-next-line:max-line-length
    //       throw new DGTErrorConfig('No TypeRegistration was found in the config matching this predicate', domainEntity.triples[0].predicate);
    //     }
    //   }

    //   domainEntity.triples[0].subject.value = domainEntity.uri + '#';

    //   return of(domainEntity).pipe(
    //     switchMap(entity => {
    //       if (missingTypeReg) {
    //         return this.typeregistrationService.registerMissingTypeRegistrations(profile).pipe(
    //           map(() => entity),
    //         );
    //       } else {
    //         return of(entity);
    //       }
    //     })
    //   );
    // }

    public query<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.debug(DGTConnectorService.name, 'Querying resources for exchange', { exchange });

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ exchange }).pipe(
            switchMap((data) =>
                this.sources
                    .get(data.exchange.source)
                    .pipe(map((source) => ({ source, ...data, connector: this.get(source.type) }))),
            ),
            // switchMap(data => this.purposes.get(data.exchange.purpose)
            //   .pipe(map(purpose => ({ ...data, purpose })))),
            // mergeMap(data => this.profiles.get(exchange).pipe(
            //   map(profile => ({ ...data, profile, typeRegistrations: profile && profile.typeRegistrations ? profile.typeRegistrations.filter(typeRegistration => data.purpose.predicates.includes(typeRegistration.forClass)) : [] })),
            // )),
            switchMap((data) =>
                data.connector.query<T>(exchange, transformer).pipe(map((resources) => ({ ...data, resources }))),
            ),
            // switchMap(data => (data.typeRegistrations && data.typeRegistrations.length > 0
            //   ? forkJoin(data.typeRegistrations.map(typeRegistration => data.connector.query<T>(exchange, transformer)))
            //   : of([[]]))
            //   .pipe(
            //     map((resourcesOfResources) =>
            //       ({ ...data, resources: [...data.resources, ..._.flatten(resourcesOfResources)] }),
            //     ),
            //   ),
            // ),
            // map(data => {
            //   const newRes = data.resources.map((resource: T) => {
            //     return {
            //       ...resource,
            //       triples: resource.triples.filter(triple => data.purpose.predicates.includes(triple.predicate)),
            //     };
            //   });
            //   return { ...data, resources: newRes };
            // }),
            tap((data) => this.logger.info(DGTConnectorService.name, 'Queried resources for exchange', data)),
            map((data) => data.resources),
            catchError((error, caught) => {
                this.logger.error(DGTConnectorService.name, 'Error while querying connectors', error, {
                    exchange,
                    transformer,
                    caught,
                });

                return of([]);
            }),
        );
    }
}
