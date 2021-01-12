import {
    DGTConnection,
    DGTConnectionService,
    DGTConnectionSolid,
    DGTConnectionSolidConfiguration,
    DGTConnectionState,
    DGTConnector,
    DGTExchange,
    DGTExchangeService,
    DGTLDRepresentationSparqlDeleteFactory,
    DGTLDRepresentationSparqlInsertFactory,
    DGTLDResource,
    DGTLDTransformer,
    DGTLDTripleFactoryService,
    DGTLDTypeRegistration,
    DGTLDTypeRegistrationTransformerService,
    DGTProfile,
    DGTProfileTransformerService,
    DGTPurpose,
    DGTSource,
    DGTSourceService,
    DGTSourceSolid,
    DGTSourceSolidConfiguration,
    DGTSourceState,
    DGTSparqlQueryService,
    DGTUriFactoryService,
} from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DGTSolidService } from '../services/dgt-solid.service';

@DGTInjectable()
export class DGTConnectorSolid extends DGTConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration> {
    constructor(
        private logger: DGTLoggerService,
        private http: DGTHttpService,
        private triples: DGTLDTripleFactoryService,
        private connections: DGTConnectionService,
        private sources: DGTSourceService,
        private exchanges: DGTExchangeService,
        private uris: DGTUriFactoryService,
        private toSparqlInsert: DGTLDRepresentationSparqlInsertFactory,
        private toSparqlDelete: DGTLDRepresentationSparqlDeleteFactory,
        private typeRegistrationsTransformer: DGTLDTypeRegistrationTransformerService,
        private profileTransformer: DGTProfileTransformerService,
        private solid: DGTSolidService,
    ) {
        super();
    }

    public add<T extends DGTLDResource>(resources: T[], transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.debug(DGTConnectorSolid.name, 'Starting to add entity', { domainEntities: resources });

        return of({ resources, transformer }).pipe(
            switchMap((data) =>
                this.exchanges.get(_.head(resources).exchange).pipe(map((exchange) => ({ ...data, exchange }))),
            ),
            switchMap((data) =>
                of(resources).pipe(
                    tap((triples) => {
                        if (!triples) {
                            throw new DGTErrorArgument(DGTConnectorSolid.name, 'No triples created by transformer');
                        }
                    }),
                    map((entities) => ({
                        ...data,
                        entities,
                        groupedEntities: _.groupBy(entities, 'uri'),
                        domainEntities: resources,
                    })),
                ),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolid.name, 'Prepared to add resource', data)),
            switchMap((data) =>
                this.connections
                    .get(data.exchange.connection)
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection }))),
            ),
            switchMap((data) => this.sources.get(data.exchange.source).pipe(map((source) => ({ ...data, source })))),
            switchMap((data) =>
                forkJoin(
                    Object.keys(data.groupedEntities).map((uri) =>
                        this.solid.generateToken(uri, data.connection, data.source).pipe(
                            map((token) => ({
                                headers: token
                                    ? { 'Content-Type': 'application/sparql-update', Authorization: 'Bearer ' + token }
                                    : { 'Content-Type': 'application/sparql-update' },
                            })),
                            switchMap((d) =>
                                this.toSparqlInsert
                                    .serialize(data.groupedEntities[uri], data.transformer)
                                    .pipe(map((serialized) => ({ ...d, serialized }))),
                            ),
                            switchMap((d) => this.http.patch(uri, d.serialized, d.headers)),
                        ),
                    ),
                ).pipe(map((response) => data.entities as T[])),
            ),
        );
    }

    public query<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.info(DGTConnectorSolid.name, 'Starting to query linked data service', { exchange, transformer });

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ exchange, transformer }).pipe(
            switchMap((data) =>
                this.connections
                    .get(data.exchange.connection)
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection }))),
            ),
            switchMap((data) => this.sources.get(data.exchange.source).pipe(map((source) => ({ ...data, source })))),
            switchMap((data) =>
                this.updateDiscovery(data.connection, data.source, data.exchange).pipe(
                    map((connection) => ({ ...data, connection })),
                ),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolid.name, 'Updated discovery', data.connection)),
            tap((data) => this.logger.debug(DGTConnectorSolid.name, JSON.stringify(data.connection), data.connection)),
            switchMap((data) =>
                forkJoin(
                    data.connection.configuration.typeRegistrations.map((typeRegistration) =>
                        this.queryOne(
                            typeRegistration.instance,
                            data.exchange,
                            data.connection,
                            data.source,
                            data.transformer,
                        ),
                    ),
                ).pipe(map((resourcesOfResources) => ({ ...data, resources: _.flatten(resourcesOfResources) }))),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolid.name, 'Transformed resources', { data })),
            map((data) => data.resources),
        );
    }

    public queryOne<T extends DGTLDResource>(
        uri: string,
        exchange: DGTExchange,
        connection: DGTConnectionSolid,
        source: DGTSourceSolid,
        transformer: DGTLDTransformer<T>,
    ): Observable<T[]> {
        this.logger.debug(DGTConnectorSolid.name, 'Starting to query linked data service on uri ' + uri, { exchange });

        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        return of({ connection, source, uri, exchange }).pipe(
            switchMap((data) =>
                data.source.state === DGTSourceState.PREPARED
                    ? of(data)
                    : this.solid.prepare(data.source).pipe(
                          switchMap((preparedSource) => this.sources.save([preparedSource])),
                          map((preparedSources) => ({ ...data, source: _.head(preparedSources) })),
                      ),
            ),
            switchMap((data) =>
                this.solid.generateToken(data.uri, data.connection, data.source).pipe(
                    map((token) => ({
                        ...data,
                        token,
                        headers: token
                            ? {
                                  Accept: 'text/turtle',
                                  Authorization: 'Bearer ' + token,
                              }
                            : { Accept: 'text/turtle' },
                    })),
                ),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolid.name, 'Generated token', data)),
            switchMap((data) =>
                this.http
                    .get<string>(data.uri, data.headers, true)
                    .pipe(
                        map((response) => ({
                            ...data,
                            response,
                            triples: response.data ? this.triples.createFromString(response.data, data.uri) : [],
                        })),
                    ),
            ),
            map((data) => ({
                ...data,
                resource: {
                    triples: data.triples,
                    uri: data.uri,
                    exchange: data.exchange.uri,
                },
            })),
            switchMap((data) =>
                transformer
                    .toDomain([data.resource])
                    .pipe(
                        map((resources) => ({
                            ...data,
                            resources: resources.map((resource) => ({
                                ...resource,
                                uri: this.uris.generate(data.resource, 'data'),
                            })),
                        })),
                    ),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolid.name, 'Transformed resources', { data })),
            map((data) => data.resources),
        );
    }

    public delete<T extends DGTLDResource>(domainEntities: T[], transformer: DGTLDTransformer<T>): Observable<T[]> {
        if (!domainEntities) {
            throw new DGTErrorArgument('domainEntities should be set.', domainEntities);
        }

        if (!transformer) {
            throw new DGTErrorArgument('transformer should be set.', transformer);
        }

        this.logger.debug(DGTSparqlQueryService.name, 'Starting to delete entity', { domainEntities });

        return of(domainEntities).pipe(
            map((entities) => ({
                entities,
                groupedEntities: _.groupBy(entities, 'uri'),
                domainEntities,
            })),
            switchMap((data) =>
                this.exchanges.get(_.head(domainEntities).exchange).pipe(map((exchange) => ({ ...data, exchange }))),
            ),
            switchMap((data) =>
                this.connections
                    .get(data.exchange.connection)
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection }))),
            ),
            switchMap((data) => this.sources.get(data.exchange.source).pipe(map((source) => ({ ...data, source })))),
            tap((data) => this.logger.debug(DGTSparqlQueryService.name, 'Prepared entities', data)),
            switchMap((data) =>
                forkJoin(
                    Object.keys(data.groupedEntities).map((uri) => {
                        return this.solid.generateToken(uri, data.connection, data.source).pipe(
                            map((token) => ({
                                headers: token
                                    ? { 'Content-Type': 'application/sparql-update', Authorization: 'Bearer ' + token }
                                    : { 'Content-Type': 'application/sparql-update' },
                            })),
                            switchMap((d) =>
                                this.toSparqlDelete
                                    .serialize(data.groupedEntities[uri], transformer)
                                    .pipe(map((serialized) => ({ ...d, serialized }))),
                            ),
                            switchMap((d) => this.http.patch(uri, d.serialized, d.headers)),
                        );
                    }),
                ).pipe(map((response) => data.entities as T[])),
            ),
        );
    }

    public save<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        return of({ resources, transformer }).pipe(
            switchMap((data) =>
                this.update(
                    resources.filter((r) => r.uri !== null),
                    data.transformer,
                ).pipe(map((updated) => ({ ...data, updated }))),
            ),
            switchMap((data) =>
                this.add(
                    resources.filter((r) => r.uri === null),
                    data.transformer,
                ).pipe(map((added) => ({ ...data, added }))),
            ),
            map((data) => [...data.added, ...data.updated]),
        );
    }

    public update<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        this.logger.debug(DGTSparqlQueryService.name, 'Starting to update entity', { resources, transformer });
        return of({ resources, transformer }).pipe(
            switchMap((data) =>
                forkJoin(
                    data.resources.map(
                        (update) =>
                            // transformer.toTriples([update.original]).pipe(
                            //   map((uTransfored) => ({ ...update, original: uTransfored[0] })),
                            // switchMap((u) =>
                            transformer.toTriples([update]).pipe(map((uTransfored) => ({ updated: uTransfored[0] }))),
                        // ),
                        // ),
                    ),
                ),
            ),
            tap((data) => this.logger.debug(DGTSparqlQueryService.name, 'Transformed updated', data)),
            map((updates) =>
                updates.map((update) => ({
                    ...update,
                    delta: {
                        updated: {
                            ...update.updated,
                            triples: update.updated.triples,
                            // triples: _.differenceWith(
                            //   update.updated.triples,
                            //   update.original.triples,
                            //   _.isEqual,
                            // ) as DGTLDTriple[],
                        },
                        // original: {
                        //   ...update.original,
                        //   triples: _.differenceWith(
                        //     update.original.triples,
                        //     update.updated.triples,
                        //     _.isEqual,
                        //   ) as DGTLDTriple[],
                        // },
                    },
                })),
            ),
            tap((data) => this.logger.debug(DGTSparqlQueryService.name, 'Prepared to update entities', data)),
            switchMap((updates) =>
                this.exchanges.get(_.head(resources).exchange).pipe(map((exchange) => ({ updates, exchange }))),
            ),
            switchMap((data) =>
                this.connections
                    .get(data.exchange.connection)
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection }))),
            ),
            switchMap((data) => this.sources.get(data.exchange.source).pipe(map((source) => ({ ...data, source })))),
            switchMap((data) =>
                forkJoin(
                    data.updates.map((update) =>
                        this.solid.generateToken(update.delta.updated.uri, data.connection, data.source).pipe(
                            map((token) => ({
                                headers: token
                                    ? { 'Content-Type': 'application/sparql-update', Authorization: 'Bearer ' + token }
                                    : { 'Content-Type': 'application/sparql-update' },
                            })),
                            switchMap((d) =>
                                this.toSparqlInsert
                                    .serialize([update.delta.updated], transformer)
                                    .pipe(map((serialized) => ({ ...d, serialized }))),
                            ),
                            switchMap((d) => {
                                // if (update.delta.original.triples.length === 0) {
                                return this.http.patch(update.delta.updated.uri, d.serialized, d.headers);
                                // }

                                // if (update.delta.updated.triples.length === 0) {
                                //   throw new DGTErrorArgument(
                                //     'Updated values are undefined',
                                //     update.delta.updated,
                                //   );
                                // }

                                // return this.http.patch(
                                //   update.delta.updated.uri,
                                //   // 'https://webhook.site/692a1b12-1512-4f36-a95a-ea410daeb4e2',
                                //   this.sparql.generateSparqlUpdate(
                                //     [update.delta.updated],
                                //     'insertdelete',
                                //     [update.delta.original],
                                //   ),
                                //   d.headers,
                                // );
                            }),
                        ),
                    ),
                ).pipe(map((response) => resources.map((update) => update))),
            ),
        );
    }

    public connect(
        purpose: DGTPurpose,
        exchange: DGTExchange,
        connection: DGTConnection<DGTConnectionSolidConfiguration>,
        source: DGTSource<DGTSourceSolidConfiguration>,
    ): Observable<DGTConnectionSolid> {
        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        this.logger.debug(DGTConnectorSolid.name, 'Starting to connect to Solid', {
            connection,
            source: source.configuration,
        });

        return of({ connection, source }).pipe(
            switchMap((data) =>
                this.solid.generateUri(data.source, data.connection).pipe(
                    map((loginUri) => ({
                        ...data,
                        connection: {
                            ...connection,
                            configuration: { ...data.connection.configuration, loginUri },
                            state: DGTConnectionState.CONNECTING,
                        } as DGTConnectionSolid,
                    })),
                ),
            ),
            map((data) => data.connection),
        );
    }

    public updateDiscovery(
        connection: DGTConnectionSolid,
        source: DGTSourceSolid,
        exchange: DGTExchange,
    ): Observable<DGTConnectionSolid> {
        this.logger.debug(DGTConnectorSolid.name, 'Starting to update discovery index.', {
            connection,
            source,
            exchange,
        });

        return of({ connection, source, exchange }).pipe(
            switchMap((data) =>
                this.loadTypeIndexes(data.connection, data.source, data.exchange).pipe(
                    map((typeIndexes) => ({
                        ...data,
                        connection: {
                            ...data.connection,
                            configuration: { ...data.connection.configuration, typeIndexes },
                        },
                    })),
                ),
            ),
            switchMap((data) =>
                this.loadTypeRegistrations(data.connection, data.source, data.exchange).pipe(
                    map((typeRegistrations) => ({
                        ...data,
                        connection: {
                            ...data.connection,
                            configuration: { ...data.connection.configuration, typeRegistrations },
                        },
                    })),
                ),
            ),
            map((data) => data.connection),
        );
    }

    public loadTypeIndexes(
        connection: DGTConnectionSolid,
        source: DGTSourceSolid,
        exchange: DGTExchange,
    ): Observable<string[]> {
        this.logger.debug(DGTConnectorSolid.name, 'Starting to retrieve all type indexes.', {
            connection,
            source,
            exchange,
        });

        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        return of({ connection, source, exchange }).pipe(
            switchMap((data) =>
                this.queryOne<DGTProfile>(
                    connection.configuration.webId,
                    data.exchange,
                    data.connection,
                    data.source,
                    this.profileTransformer,
                ).pipe(map((profiles) => ({ ...data, profiles }))),
            ),
            map((data) =>
                _.flatten(data.profiles.map((profile) => [profile.privateTypeIndex, profile.publicTypeIndex])),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolid.name, 'Retrieved type indexes.', data)),
        );
    }

    public loadTypeRegistrations(
        connection: DGTConnectionSolid,
        source: DGTSourceSolid,
        exchange: DGTExchange,
    ): Observable<DGTLDTypeRegistration[]> {
        this.logger.debug(DGTConnectorSolid.name, 'Starting to retrieve all type registrations.', {
            typeIndexes: connection?.configuration?.typeIndexes,
            connection,
        });

        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        return of({ connection, source, exchange }).pipe(
            switchMap((data) =>
                forkJoin(
                    data.connection.configuration.typeIndexes
                        .filter((typeIndex) => typeIndex !== null)
                        .map((typeIndex) =>
                            this.queryOne(
                                typeIndex,
                                data.exchange,
                                data.connection,
                                data.source,
                                this.typeRegistrationsTransformer,
                            ).pipe(
                                catchError((error) => {
                                    this.logger.error(
                                        DGTConnectorSolid.name,
                                        'Error while querying type registrations',
                                        error,
                                    );

                                    return of([]);
                                }),
                            ),
                        ),
                ).pipe(
                    map((typeRegistrations) => ({
                        ...data,
                        typeRegistrations: [
                            ..._.flatten(typeRegistrations),
                            {
                                instance: data.connection.configuration.webId,
                                forClass: 'http://xmlns.com/foaf/0.1/Person',
                            } as DGTLDTypeRegistration,
                        ],
                    })),
                ),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolid.name, 'Retrieved type registrations.', data)),
            map((data) => data.typeRegistrations),
        );
    }
}
