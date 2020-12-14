import { Observable, of, forkJoin, from } from 'rxjs';
import { DGTPurpose, DGTConnector, DGTExchange, DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration, DGTConnectionSolid, DGTLDTriple, DGTLDResource, DGTLDTransformer, DGTSparqlQueryService, DGTSourceService, DGTLDTripleFactoryService, DGTConnectionService, DGTExchangeService, DGTUriFactoryService, DGTLDRepresentationSparqlInsertFactory, DGTConnection, DGTSource, DGTSourceSolid, DGTSourceType, DGTSourceState } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTErrorArgument, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { switchMap, map, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Session } from '@inrupt/solid-client-authn-browser';
import { DGTSourceSolidConnector } from '@digita-ai/dgt-shared-connectors/public-api';

@DGTInjectable()
export class DGTConnectorSolidWeb extends DGTConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration> {
    constructor(
        private logger: DGTLoggerService,
        private triples: DGTLDTripleFactoryService,
        private connections: DGTConnectionService,
        private sources: DGTSourceService,
        private sparql: DGTSparqlQueryService,
        private exchanges: DGTExchangeService,
        private uris: DGTUriFactoryService,
        private toSparqlInsert: DGTLDRepresentationSparqlInsertFactory,
        private session: Session,
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

        return of({ resources, transformer })
            .pipe(
                switchMap(data => this.exchanges.get(_.head(resources).exchange)
                    .pipe(map(exchange => ({ ...data, exchange })))),
                switchMap(data => of(resources)
                    .pipe(
                        tap(triples => {
                            if (!triples) {
                                throw new DGTErrorArgument(DGTConnectorSolidWeb.name, 'No triples created by transformer');
                            }
                        }),
                        map(entities => ({ ...data, entities, groupedEntities: _.groupBy(entities, 'uri'), domainEntities: resources, }))
                    )
                ),
                tap(data => this.logger.debug(DGTConnectorSolidWeb.name, 'Prepared to add resource', data)),
                switchMap(data => this.connections.get(data.exchange.connection)
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection })))),
                switchMap(data => this.sources.get(data.exchange.source)
                    .pipe(map(source => ({ ...data, source })))),
                switchMap(data => forkJoin(Object.keys(data.groupedEntities).map(uri =>
                    this.toSparqlInsert.serialize(data.groupedEntities[uri], data.transformer)
                        .pipe(map(serialized => this.session.fetch(uri, { method: 'POST', body: serialized, headers: { 'Content-Type': 'application/sparql-update' } })))))
                    .pipe(map(() => data.entities as T[]))
                )
            );
    }


    query<T extends DGTLDResource>(uri: string, exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.debug(DGTConnectorSolidWeb.name, 'Starting to query linked data service', { uri, exchange, transformer });

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ exchange, uri })
            .pipe(
                switchMap(data => this.connections.get(data.exchange.connection)
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection, uri: data.uri ? data.uri : connection.configuration.webId })))),
                tap(data => this.logger.debug(DGTConnectorSolidWeb.name, 'Retrieved connetion', data)),
                switchMap(data => this.sources.get(data.exchange.source)
                    .pipe(map(source => ({ ...data, source })))),
                tap(data => this.logger.debug(DGTConnectorSolidWeb.name, 'Retrieved source', data)),
                map(data => ({ ...data, headers: { Accept: 'text/turtle' } })),
                tap(data => this.logger.debug(DGTConnectorSolidWeb.name, 'Generated token', data)),
                switchMap(data => from(this.session.fetch(data.uri, { method: 'GET', headers: data.headers }))
                    .pipe(map(response => ({ ...data, response, triples: response.text ? this.triples.createFromString(response.text.toString(), data.uri) : [] })))),
                tap(data => this.logger.debug(DGTConnectorSolidWeb.name, 'Request completed', data)),
                map(data => ({
                    ...data, resource: {
                        triples: data.triples,
                        uri: data.uri,
                        exchange: data.exchange.uri
                    }
                })),
                map(data => ({ ...data, resource: { ...data.resource, uri: this.uris.generate(data.resource, 'data') } })),
                switchMap(data => transformer.toDomain([data.resource])),
                tap(data => this.logger.debug(DGTConnectorSolidWeb.name, 'Transformed resources', { data })),
            ) as Observable<T[]>;
    }

    delete<T extends DGTLDResource>(domainEntities: T[], transformer: DGTLDTransformer<T>): Observable<T[]> {
        if (!domainEntities) {
            throw new DGTErrorArgument(
                'domainEntities should be set.',
                domainEntities
            );
        }

        if (!transformer) {
            throw new DGTErrorArgument('transformer should be set.', transformer);
        }

        this.logger.debug(
            DGTSparqlQueryService.name,
            'Starting to delete entity',
            { domainEntities }
        );

        return of(domainEntities).pipe(
            map((entities) => ({
                entities,
                groupedEntities: _.groupBy(entities, 'uri'),
                domainEntities,
            })),
            switchMap(data => this.exchanges.get(_.head(domainEntities).exchange)
                .pipe(map(exchange => ({ ...data, exchange })))),
            switchMap(data => this.connections.get(data.exchange.connection)
                .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection })))),
            switchMap(data => this.sources.get(data.exchange.source)
                .pipe(map(source => ({ ...data, source })))),
            tap((data) =>
                this.logger.debug(
                    DGTSparqlQueryService.name,
                    'Prepared entities',
                    data
                )
            ),
            switchMap(data => forkJoin(Object.keys(data.groupedEntities).map(uri =>
                this.toSparqlInsert.serialize(data.groupedEntities[uri], transformer)
                    .pipe(map(serialized => this.session.fetch(uri, { method: 'DELETE', body: serialized, headers: { 'Content-Type': 'application/sparql-update' } })))))
                .pipe(map(() => data.entities as T[]))
            )
        );
    }
    update<R extends DGTLDResource>(domainEntities: { original: R; updated: R; }[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        if (!domainEntities) {
            throw new DGTErrorArgument(
                'domainEntities should be set.',
                domainEntities
            );
        }

        if (!transformer) {
            throw new DGTErrorArgument('transformer should be set.', transformer);
        }

        this.logger.debug(
            DGTSparqlQueryService.name,
            'Starting to update entity',
            { domainEntities, transformer }
        );
        return forkJoin(
            domainEntities.map((update) =>
                transformer.toTriples([update.original]).pipe(
                    map((uTransfored) => ({ ...update, original: uTransfored[0] })),
                    switchMap((u) =>
                        transformer
                            .toTriples([u.updated])
                            .pipe(map((uTransfored) => ({ ...u, updated: uTransfored[0] })))
                    )
                )
            )
        ).pipe(
            tap((data) =>
                this.logger.debug(
                    DGTSparqlQueryService.name,
                    'Transformed updated',
                    data
                )
            ),
            map((updates) =>
                updates.map((update) => ({
                    ...update,
                    delta: {
                        updated: {
                            ...update.updated,
                            triples: _.differenceWith(
                                update.updated.triples,
                                update.original.triples,
                                _.isEqual
                            ) as DGTLDTriple[],
                        },
                        original: {
                            ...update.original,
                            triples: _.differenceWith(
                                update.original.triples,
                                update.updated.triples,
                                _.isEqual
                            ) as DGTLDTriple[],
                        },
                    },
                }))
            ),
            tap((data) =>
                this.logger.debug(
                    DGTSparqlQueryService.name,
                    'Prepared to update entities',
                    data
                )
            ),
            switchMap(updates => this.exchanges.get(_.head(domainEntities).original.exchange)
                .pipe(map(exchange => ({ updates, exchange })))),
            switchMap(data => this.connections.get(data.exchange.connection)
                .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection })))),
            switchMap(data => this.sources.get(data.exchange.source)
                .pipe(map(source => ({ ...data, source })))),
            switchMap((data) =>
                forkJoin(
                    data.updates.map((update) =>
                        this.toSparqlInsert.serialize([update.delta.updated], transformer).pipe(
                            switchMap(() => this.toSparqlInsert.serialize([update.delta.updated], transformer)
                                .pipe(map(serialized => ({ ...data, serialized })))),
                            switchMap(d => {
                                if (update.delta.original.triples.length === 0) {
                                    return this.session.fetch(update.delta.updated.uri, { method: 'PATCH', body: d.serialized, headers: { 'Content-Type': 'application/sparql-update', } });
                                }
                                if (update.delta.updated.triples.length === 0) {
                                    throw new DGTErrorArgument(
                                        'Updated values are undefined',
                                        update.delta.updated
                                    );
                                }
                                return this.session.fetch(update.delta.updated.uri, { method: 'PATCH', body: this.sparql.generateSparqlUpdate([update.delta.updated], 'insertdelete', [update.delta.original]), headers: { 'Content-Type': 'application/sparql-update' } });

                            })
                        )
                    )
                ).pipe(
                    map(() => domainEntities.map((update) => update.updated))
                )
            )
        );
    }

    public prepare(source: DGTSourceSolid): Observable<DGTSourceSolid> {

        if (!source || source.type !== DGTSourceType.SOLID) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        this.logger.debug(DGTSourceSolidConnector.name, 'Starting to prepare source for connection', { source });

        return of({ source })
            .pipe(
                map(data => ({ source: { ...data.source, state: DGTSourceState.PREPARED } })),
                tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Prepared source for connection', data.source)),
                map(data => data.source),
            );
    }
}
