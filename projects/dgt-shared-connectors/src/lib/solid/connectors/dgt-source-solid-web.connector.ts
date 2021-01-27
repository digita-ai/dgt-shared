import {
    DGTConnectionService,
    DGTConnectionSolid,
    DGTConnectionSolidConfiguration,
    DGTConnector,
    DGTExchange,
    DGTExchangeService,
    DGTLDRepresentationSparqlDeleteFactory,
    DGTLDRepresentationSparqlInsertFactory,
    DGTLDResource,
    DGTLDTransformer,
    DGTLDTriple,
    DGTLDTripleFactoryService,
    DGTLDTypeRegistration,
    DGTLDTypeRegistrationTransformerService,
    DGTProfile,
    DGTProfileTransformerService,
    DGTSourceService,
    DGTSourceSolid,
    DGTSourceSolidConfiguration,
    DGTSourceState,
    DGTSparqlQueryService,
    DGTUriFactoryService,
} from '@digita-ai/dgt-shared-data';
import {
    DGTErrorArgument,
    DGTErrorNotImplemented,
    DGTHttpService,
    DGTInjectable,
    DGTLoggerService,
} from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DGTOIDCService } from '../../oidc/services/dgt-oidc.service';
import { DGTSolidService } from '../services/dgt-solid.service';

@DGTInjectable()
export class DGTConnectorSolidWeb extends DGTConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration> {
    constructor(
        private logger: DGTLoggerService,
        private http: DGTHttpService,
        private triples: DGTLDTripleFactoryService,
        private connections: DGTConnectionService,
        private sources: DGTSourceService,
        private sparql: DGTSparqlQueryService,
        private exchanges: DGTExchangeService,
        private uris: DGTUriFactoryService,
        private toSparqlInsert: DGTLDRepresentationSparqlInsertFactory,
        private toSparqlDelete: DGTLDRepresentationSparqlDeleteFactory,
        private oidc: DGTOIDCService,
        private solid: DGTSolidService,
        private typeRegistrationsTransformer: DGTLDTypeRegistrationTransformerService,
        private profileTransformer: DGTProfileTransformerService,
    ) {
        super();
    }

    add<T extends DGTLDResource>(resources: T[], transformer: DGTLDTransformer<T>): Observable<T[]> {
        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!transformer) {
            throw new DGTErrorArgument('transformer should be set.', transformer);
        }

        this.logger.debug(DGTConnectorSolidWeb.name, 'Starting to add entity', { domainEntities: resources });

        return of({ resources, transformer }).pipe(
            switchMap((data) =>
                this.exchanges.get(_.head(resources).exchange).pipe(map((exchange) => ({ ...data, exchange }))),
            ),
            switchMap((data) =>
                of(resources).pipe(
                    tap((triples) => {
                        if (!triples) {
                            throw new DGTErrorArgument(DGTConnectorSolidWeb.name, 'No triples created by transformer');
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
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Prepared to add resource', data)),
            switchMap((data) =>
                this.connections
                    .get(data.exchange.connection)
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection }))),
            ),
            switchMap((data) =>
                this.oidc.getSession(data.connection.configuration.sessionInfo.sessionId).pipe(
                    map((session) => ({
                        ...data,
                        session,
                        headers: { 'Content-Type': 'application/sparql-update' },
                    })),
                ),
            ),
            switchMap((data) =>
                forkJoin(
                    Object.keys(data.groupedEntities).map((uri) =>
                        of(uri).pipe(
                            switchMap(() =>
                                this.toSparqlInsert
                                    .serialize(data.groupedEntities[uri], data.transformer)
                                    .pipe(map((serialized) => ({ ...data, serialized }))),
                            ),
                            switchMap((d) => this.http.patch(uri, d.serialized, d.headers, d.session)),
                        ),
                    ),
                ).pipe(map(() => data.entities as T[])),
            ),
        );
    }

    public save<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        this.logger.debug(DGTConnectorSolidWeb.name, 'Starting to save resources', { resources, transformer });
        return of({
            resources,
            transformer,
            updated: resources.filter((r) => r.uri !== null),
            added: resources.filter((r) => r.uri === null),
        }).pipe(
            switchMap((data) =>
                data.updated && data.updated.length > 0
                    ? this.update(data.updated, data.transformer).pipe(map((updated) => ({ ...data, updated })))
                    : of(data),
            ),
            switchMap((data) =>
                data.added && data.added.length > 0
                    ? this.add(data.added, data.transformer).pipe(map((added) => ({ ...data, added })))
                    : of(data),
            ),
            map((data) => [...data.added, ...data.updated]),
        );
    }

    public query<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.info(DGTConnectorSolidWeb.name, 'Starting to query linked data service', { exchange, transformer });

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
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Updated discovery', data.connection)),
            tap((data) =>
                this.logger.debug(DGTConnectorSolidWeb.name, JSON.stringify(data.connection), data.connection),
            ),
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
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Transformed resources', { data })),
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
        this.logger.debug(DGTConnectorSolidWeb.name, 'Starting to query linked data service', {
            uri,
            exchange,
            transformer,
        });

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ exchange, uri }).pipe(
            switchMap((data) =>
                this.connections
                    .get(data.exchange.connection)
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection }))),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Retrieved connection', data)),
            switchMap((data) => this.sources.get(data.exchange.source).pipe(map((source) => ({ ...data, source })))),
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Retrieved source', data)),
            switchMap((data) =>
                this.oidc.getSession(data.connection.configuration.sessionInfo.sessionId).pipe(
                    map((session) => ({
                        ...data,
                        session,
                        headers: { Accept: 'text/turtle' },
                        uri: data.uri ? data.uri : session.info.webId,
                    })),
                ),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Retrieved session', data)),
            switchMap((data) =>
                this.http.get<string>(data.uri, data.headers, true, data.session).pipe(
                    map((response) => ({
                        ...data,
                        response,
                        triples: response.data ? this.triples.createFromString(response.data, data.uri) : [],
                    })),
                ),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Request completed', data)),
            map((data) => ({
                ...data,
                resource: {
                    triples: data.triples,
                    uri: data.uri,
                    exchange: data.exchange.uri,
                },
            })),
            switchMap((data) =>
                transformer.toDomain([data.resource]).pipe(
                    map((resources) => ({
                        ...data,
                        resources,
                    })),
                ),
            ),
            switchMap((data) =>
                this.uris
                    .generate(data.resources, 'data', data.connection)
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as T[] }))),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Transformed resources', { data })),
            map((data) => data.resources),
        ) as Observable<T[]>;
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
            switchMap((data) =>
                this.oidc.getSession(data.connection.configuration.sessionInfo.sessionId).pipe(
                    map((session) => ({
                        ...data,
                        session,
                        headers: { 'Content-Type': 'application/sparql-update' },
                    })),
                ),
            ),
            tap((data) => this.logger.debug(DGTSparqlQueryService.name, 'Prepared entities', data)),
            switchMap((data) =>
                forkJoin(
                    Object.keys(data.groupedEntities).map((uri) =>
                        of(uri).pipe(
                            switchMap(() =>
                                this.toSparqlDelete
                                    .serialize(data.groupedEntities[uri], transformer)
                                    .pipe(map((serialized) => ({ ...data, serialized }))),
                            ),
                            switchMap((d) => this.http.patch(uri, d.serialized, d.headers, d.session)),
                        ),
                    ),
                ).pipe(map(() => data.entities as T[])),
            ),
        );
    }

    public update<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        this.logger.debug(DGTConnectorSolidWeb.name, 'Starting to update resources', { resources, transformer });

        return of({ resources, transformer }).pipe(
            switchMap((data) =>
                forkJoin(
                    data.resources.map((update) =>
                        transformer.toTriples([update]).pipe(map((uTransfored) => ({ updated: uTransfored[0] }))),
                    ),
                ),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Transformed updated', data)),
            map((updates) =>
                updates.map((update) => ({
                    ...update,
                    delta: {
                        updated: {
                            ...update.updated,
                            triples: update.updated.triples,
                        },
                    },
                })),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Prepared to update entities', data)),
            switchMap((updates) =>
                this.exchanges.get(_.head(resources).exchange).pipe(map((exchange) => ({ updates, exchange }))),
            ),
            switchMap((data) =>
                this.connections
                    .get(data.exchange.connection)
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection }))),
            ),
            switchMap((data) =>
                this.oidc.getSession(data.connection.configuration.sessionInfo.sessionId).pipe(
                    map((session) => ({
                        ...data,
                        session,
                        headers: { 'Content-Type': 'application/sparql-update' },
                    })),
                ),
            ),
            switchMap((data) => this.sources.get(data.exchange.source).pipe(map((source) => ({ ...data, source })))),
            switchMap((data) =>
                forkJoin(
                    data.updates.map((update) =>
                        of(update).pipe(
                            switchMap(() =>
                                this.toSparqlInsert
                                    .serialize([update.delta.updated], transformer)
                                    .pipe(map((serialized) => ({ ...data, serialized }))),
                            ),
                            switchMap((data) => {
                                return this.http.patch(
                                    update.delta.updated.uri,
                                    data.serialized,
                                    {
                                        'Content-Type': 'application/sparql-update',
                                    },
                                    data.session,
                                );
                            }),
                        ),
                    ),
                ).pipe(map(() => resources.map((update) => update))),
            ),
        );
    }

    public updateValues<R extends DGTLDResource>(
        domainEntities: { original: R; updated: R }[],
        transformer: DGTLDTransformer<R>,
    ): Observable<R[]> {
        if (!domainEntities) {
            throw new DGTErrorArgument('domainEntities should be set.', domainEntities);
        }

        if (!transformer) {
            throw new DGTErrorArgument('transformer should be set.', transformer);
        }

        this.logger.debug(DGTSparqlQueryService.name, 'Starting to update entity', { domainEntities, transformer });
        return forkJoin(
            domainEntities.map((update) =>
                transformer.toTriples([update.original]).pipe(
                    map((uTransfored) => ({ ...update, original: uTransfored[0] })),
                    switchMap((u) =>
                        transformer
                            .toTriples([u.updated])
                            .pipe(map((uTransfored) => ({ ...u, updated: uTransfored[0] }))),
                    ),
                ),
            ),
        ).pipe(
            tap((data) => this.logger.debug(DGTSparqlQueryService.name, 'Transformed updated', data)),
            map((updates) =>
                updates.map((update) => ({
                    ...update,
                    delta: {
                        updated: {
                            ...update.updated,
                            triples: _.differenceWith(
                                update.updated.triples,
                                update.original.triples,
                                _.isEqual,
                            ) as DGTLDTriple[],
                        },
                        original: {
                            ...update.original,
                            triples: _.differenceWith(
                                update.original.triples,
                                update.updated.triples,
                                _.isEqual,
                            ) as DGTLDTriple[],
                        },
                    },
                })),
            ),
            tap((data) => this.logger.debug(DGTSparqlQueryService.name, 'Prepared to update entities', data)),
            switchMap((updates) =>
                this.exchanges
                    .get(_.head(domainEntities).original.exchange)
                    .pipe(map((exchange) => ({ updates, exchange }))),
            ),
            switchMap((data) =>
                this.connections
                    .get(data.exchange.connection)
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection }))),
            ),
            switchMap((data) => this.sources.get(data.exchange.source).pipe(map((source) => ({ ...data, source })))),
            switchMap((data) =>
                this.oidc.getSession(data.connection.configuration.sessionInfo.sessionId).pipe(
                    map((session) => ({
                        ...data,
                        session,
                        headers: { 'Content-Type': 'application/sparql-update' },
                    })),
                ),
            ),
            switchMap((data) =>
                forkJoin(
                    data.updates.map((update) =>
                        of(update).pipe(
                            switchMap(() =>
                                this.toSparqlInsert
                                    .serialize([update.delta.updated], transformer)
                                    .pipe(map((serialized) => ({ ...data, serialized }))),
                            ),
                            switchMap((d) => {
                                if (update.delta.original.triples.length === 0) {
                                    return this.http.patch(
                                        update.delta.updated.uri,
                                        d.serialized,
                                        d.headers,
                                        d.session,
                                    );
                                }

                                if (update.delta.updated.triples.length === 0) {
                                    throw new DGTErrorArgument('Updated values are undefined', update.delta.updated);
                                }

                                return this.http.patch(
                                    update.delta.updated.uri,
                                    this.sparql.generateSparqlUpdate([update.delta.updated], 'insertdelete', [
                                        update.delta.original,
                                    ]),
                                    d.headers,
                                    d.session,
                                );
                            }),
                        ),
                    ),
                ).pipe(map(() => domainEntities.map((update) => update.updated))),
            ),
        );
    }

    public connect(): Observable<DGTConnectionSolid> {
        throw new DGTErrorNotImplemented();
    }

    public updateDiscovery(
        connection: DGTConnectionSolid,
        source: DGTSourceSolid,
        exchange: DGTExchange,
    ): Observable<DGTConnectionSolid> {
        this.logger.debug(DGTConnectorSolidWeb.name, 'Starting to update discovery index.', {
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
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Loaded TypeIndexes.', { data })),
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
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Loaded TypeRegistrations.', { data })),
            map((data) => data.connection),
        );
    }

    public loadTypeIndexes(
        connection: DGTConnectionSolid,
        source: DGTSourceSolid,
        exchange: DGTExchange,
    ): Observable<string[]> {
        this.logger.debug(DGTConnectorSolidWeb.name, 'Starting to retrieve all type indexes.', {
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
                    connection.configuration.sessionInfo.webId,
                    data.exchange,
                    data.connection,
                    data.source,
                    this.profileTransformer,
                ).pipe(map((profiles) => ({ ...data, profiles }))),
            ),
            map((data) =>
                _.flatten(data.profiles.map((profile) => [profile.privateTypeIndex, profile.publicTypeIndex])),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Retrieved type indexes.', data)),
        );
    }

    public loadTypeRegistrations(
        connection: DGTConnectionSolid,
        source: DGTSourceSolid,
        exchange: DGTExchange,
    ): Observable<DGTLDTypeRegistration[]> {
        this.logger.debug(DGTConnectorSolidWeb.name, 'Starting to retrieve all type registrations.', {
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
                                        DGTConnectorSolidWeb.name,
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
                                instance: data.connection.configuration.sessionInfo.webId,
                                forClass: 'http://xmlns.com/foaf/0.1/Person',
                            } as DGTLDTypeRegistration,
                        ],
                    })),
                ),
            ),
            tap((data) => this.logger.debug(DGTConnectorSolidWeb.name, 'Retrieved type registrations.', data)),
            map((data) => data.typeRegistrations),
        );
    }
}
