import { DGTConnectionService, DGTConnectionSolid, DGTConnectionSolidConfiguration, DGTConnector, DGTExchange, DGTExchangeService, DGTLDRepresentationSparqlDeleteFactory, DGTLDRepresentationSparqlInsertFactory, DGTLDResource, DGTLDTransformer, DGTLDTriple, DGTLDTripleFactoryService, DGTPurposeService, DGTSourceService, DGTSourceSolid, DGTSourceSolidConfiguration, DGTSourceState, DGTSparqlQueryService, DGTUriFactoryService } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTHttpService, DGTInjectable, DGTLoggerService, DGTOriginService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTOIDCService } from '../../oidc/services/dgt-oidc.service';
import { DGTSourceSolidLogin } from '../models/dgt-source-solid-login.model';
import { DGTSourceSolidTrustedAppMode } from '../models/dgt-source-solid-trusted-app-mode.model';
import { DGTSourceSolidTrustedApp } from '../models/dgt-source-solid-trusted-app.model';
import { DGTSourceSolidTrustedAppTransformerService } from '../services/dgt-source-solid-trusted-app-transformer.service';

@DGTInjectable()
export class DGTConnectorSolidWeb extends DGTConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration> {

    constructor(
        private logger: DGTLoggerService,
        private http: DGTHttpService,
        private origin: DGTOriginService,
        private transformer: DGTSourceSolidTrustedAppTransformerService,
        private triples: DGTLDTripleFactoryService,
        private connections: DGTConnectionService,
        private purposes: DGTPurposeService,
        private sources: DGTSourceService,
        private sparql: DGTSparqlQueryService,
        private exchanges: DGTExchangeService,
        private uris: DGTUriFactoryService,
        private toSparqlInsert: DGTLDRepresentationSparqlInsertFactory,
        private toSparqlDelete: DGTLDRepresentationSparqlDeleteFactory,
        private oidc: DGTOIDCService,
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
                switchMap(data => this.oidc.getSession(data.connection.configuration.session.info.sessionId)
                    .pipe(map(session => ({ ...data, session, headers: { 'Content-Type': 'application/sparql-update', } })))),
                switchMap(data => forkJoin(Object.keys(data.groupedEntities).map(uri =>
                    of(uri).pipe(
                        switchMap(() => this.toSparqlInsert.serialize(data.groupedEntities[uri], data.transformer).pipe(
                            map(serialized => ({ ...data, serialized }))
                        )),
                        switchMap(d => this.http.patch(uri, d.serialized, d.headers, d.session)))))
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
                    .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection })))),
                tap(data => this.logger.debug(DGTConnectorSolidWeb.name, 'Retrieved connetion', data)),
                switchMap(data => this.sources.get(data.exchange.source)
                    .pipe(map(source => ({ ...data, source })))),
                tap(data => this.logger.debug(DGTConnectorSolidWeb.name, 'Retrieved source', data)),
                switchMap(data => this.oidc.getSession(data.connection.configuration.session.info.sessionId)
                    .pipe(map(session => ({ ...data, session, headers: { 'Accept': 'text/turtle' }, uri: data.uri ? data.uri : session.info.webId })))),
                switchMap(data => this.http.get<string>(data.uri, data.headers, true, data.session)
                    .pipe(map(response => ({ ...data, response, triples: response.data ? this.triples.createFromString(response.data, data.uri) : [] })))),
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
            switchMap(data => this.oidc.getSession(data.connection.configuration.session.info.sessionId)
                .pipe(map(session => ({ ...data, session, headers: { 'Content-Type': 'application/sparql-update', } })))),
            tap((data) =>
                this.logger.debug(
                    DGTSparqlQueryService.name,
                    'Prepared entities',
                    data
                )
            ),
            switchMap((data) =>
                forkJoin(
                    Object.keys(data.groupedEntities).map((uri) =>
                        of(uri).pipe(
                            switchMap(() => this.toSparqlDelete.serialize(data.groupedEntities[uri], transformer)
                                .pipe(map(serialized => ({ ...data, serialized })))),
                            switchMap(d => this.http.patch(uri, d.serialized, d.headers, d.session)))))
                    .pipe(map(() => data.entities as T[]))),

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
            switchMap(data => this.oidc.getSession(data.connection.configuration.session.info.sessionId)
                .pipe(map(session => ({ ...data, session, headers: { 'Content-Type': 'application/sparql-update', } })))),
            switchMap((data) =>
                forkJoin(
                    data.updates.map((update) =>
                        of(update).pipe(
                            switchMap(() => this.toSparqlInsert.serialize([update.delta.updated], transformer)
                                .pipe(map(serialized => ({ ...data, serialized })))),
                            switchMap(d => {
                                if (update.delta.original.triples.length === 0) {
                                    return this.http.patch(update.delta.updated.uri, d.serialized, d.headers, d.session);
                                }

                                if (update.delta.updated.triples.length === 0) {
                                    throw new DGTErrorArgument('Updated values are undefined', update.delta.updated);
                                }

                                return this.http.patch(update.delta.updated.uri, this.sparql.generateSparqlUpdate([update.delta.updated], 'insertdelete', [update.delta.original]), d.headers, d.session);
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

        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        this.logger.debug(DGTConnectorSolidWeb.name, 'Starting to prepare source for connection', { source });

        return of({ source })
            .pipe(
                switchMap(data => this.discover(data.source)
                    .pipe(map(configuration => ({ ...data, source: { ...data.source, configuration: { ...data.source.configuration, ...configuration } } })))),
                switchMap(data => this.register(data.source)
                    .pipe(map(configuration => ({ ...data, source: { ...data.source, state: DGTSourceState.PREPARED, configuration: { ...data.source.configuration, ...configuration } } })))),
                tap(src => this.logger.debug(DGTConnectorSolidWeb.name, 'Prepared source for connection', { src })),
                map(data => data.source)
            );
    }

    public connect(): Observable<DGTConnectionSolid> {
        throw new DGTErrorNotImplemented();
    }

    private register(source: DGTSourceSolid): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTConnectorSolidWeb.name, 'Registering client', {
            source,
        });


        const encodedCallbackUri = source.configuration.callbackUri;
        const uri = `${source.configuration.registration_endpoint}`;
        const headers = { 'Content-Type': 'application/json' };
        const params = {
            client_name: 'Digita Consumer Client',
            client_uri: this.origin.get(),
            logo_uri: `${this.origin.get()}assets/images/logo.png`,
            response_types: ['code', 'code id_token token'],
            grant_types: ['authorization_code'],
            default_max_age: 7200,
            post_logout_redirect_uris: [`${this.origin.get()}connect/logout`],
            redirect_uris: [encodedCallbackUri]
        };
        const body = JSON.stringify(Object.assign({}, params, {}));

        return this.http.post<DGTSourceSolidConfiguration>(uri, body, headers).pipe(
            tap((response) =>
                this.logger.debug(
                    DGTConnectorSolidWeb.name,
                    'Received registration response',
                    { response, source }
                )
            ),
            map((response) => ({ ...source.configuration, ...response.data }))
        );
    }


    public checkAccessRights(exchange: DGTExchange): Observable<boolean> {
        this.logger.debug(DGTConnectorSolidWeb.name, 'Checking access rights', { exchange });

        return of(exchange).pipe(
            switchMap(data => this.connections.get(exchange.connection).pipe(
                map(connection => ({ ...data, connection }))
            )),
            switchMap(data => this.purposes.get(exchange.purpose).pipe(
                map(purpose => ({ ...data, purpose }))
            )),
            switchMap(data => this.query<DGTSourceSolidTrustedApp>(null, exchange, this.transformer).pipe(
                map(trustedApps => ({ ...data, trustedApps }))
            )),
            tap(data => this.logger.debug(DGTConnectorSolidWeb.name, 'Retrieved trusted apps', data.trustedApps)),
            map(data => ({ ...data, ourTrustedApp: data.trustedApps.find(app => this.origin.get().includes(app.origin)) })),
            tap(data => this.logger.debug(DGTConnectorSolidWeb.name, 'Found our trusted app', data.ourTrustedApp)),
            map(data => {
                let res = false;
                const aclsNeeded: string[] = data.purpose.aclNeeded ? data.purpose.aclNeeded : [DGTSourceSolidTrustedAppMode.READ];


                if (data.ourTrustedApp && aclsNeeded.every(acl => data.ourTrustedApp.modes.includes(acl as DGTSourceSolidTrustedAppMode))) {
                    res = true;
                }

                this.logger.debug(DGTConnectorSolidWeb.name, 'Checked if acl modes are included', { res, aclsNeeded, ourTrustedApp: data.ourTrustedApp })

                return res;
            })
        );
    }

    /**
     * Registers an account on a solid server
     * @param source source to create account on
     * @param loginData data to use to create the account
     * @returns the http response
     */
    registerAccount(
        source: DGTSourceSolid,
        loginData: DGTSourceSolidLogin
    ): Observable<any> {
        this.logger.debug(DGTConnectorSolidWeb.name, 'Registering account', {
            source,
        });

        const uri = source.configuration.issuer + '/api/accounts/new';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: '*/*',
        };

        const body = `username=${loginData.username}&name=${loginData.name}&password=${loginData.password}&repeat_password=${loginData.password}&email=${loginData.email}`;

        return this.http.post<any>(uri, body, headers).pipe(
            tap((response) =>
                this.logger.debug(
                    DGTConnectorSolidWeb.name,
                    'Received registration response',
                    { response, source }
                )
            ),
            map((response) => ({ response, ...source.configuration }))
        );
    }

    /**
     * This function will check if a specific username is already taken
     * on a specific solid server
     * @param source The source you want to check the username on
     * @param username The username you want to check for existance
     * @returns True if the username is available, false if not
     */
    public isAvailableUsername(
        source: DGTSourceSolid,
        username: string
    ): Observable<boolean> {
        this.logger.debug(
            DGTConnectorSolidWeb.name,
            'Checking if username exists on solid server',
            { source, username }
        );

        const sourceuri = source.configuration.issuer;
        const url = 'https://' + username + '.' + sourceuri.split('//')[1];

        return this.http.head<DGTSourceSolidConfiguration>(url).pipe(
            tap((response) =>
                this.logger.debug(DGTConnectorSolidWeb.name, 'Received response', {
                    response,
                })
            ),
            map((response) => response.status === 404)
        );
    }

    private discover(
        source: DGTSourceSolid
    ): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTConnectorSolidWeb.name, 'Discovering source', {
            source,
        });

        const url = `${source.configuration.issuer}/.well-known/openid-configuration`;

        return this.http.get<DGTSourceSolidConfiguration>(url).pipe(
            tap((response) =>
                this.logger.debug(
                    DGTConnectorSolidWeb.name,
                    'Received discover response',
                    { response }
                )
            ),
            map((response) => ({ ...source.configuration, ...response.data }))
        );
    }

    /**
     * Check if a solid server is running on the given url
     * @param url url to test
     * @returns true if the specified url is a solid server, false if not
     */
    public isSolidServer(url: string): Observable<boolean> {
        if (!url) {
            this.logger.debug(
                DGTConnectorSolidWeb.name,
                'URL was undefined or null',
                url
            );
            return of(false);
        }
        // Test if url is valid
        // Copyright (c) 2010-2018 Diego Perini (http://www.iport.it)
        const reg = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
        if (!reg.test(url)) {
            this.logger.debug(DGTConnectorSolidWeb.name, 'URL was not valid', url);
            return of(false);
        } else {
            // Check headers for Link
            return (
                this.http.head(url).pipe(
                    map((res) => {
                        const headers = res.headers;
                        if (res.status !== 200) {
                            this.logger.debug(
                                DGTConnectorSolidWeb.name,
                                'Status was not 200',
                                res.status
                            );
                            return false;
                        } else if (!headers.has('link')) {
                            this.logger.debug(
                                DGTConnectorSolidWeb.name,
                                'Headers did not contain Link',
                                headers
                            );
                            return false;
                        } else if (
                            headers.get('link') !==
                            '<.acl>; rel="acl", <.meta>; rel="describedBy", <http://www.w3.org/ns/ldp#Resource>; rel="type"'
                        ) {
                            this.logger.debug(
                                DGTConnectorSolidWeb.name,
                                'Link header value did not match',
                                headers.get('link')
                            );
                            return false;
                        } else {
                            return true;
                        }
                    })
                ) &&
                // Check if /.well-known/openid-configuration exists on server
                this.http.get(url + '/.well-known/openid-configuration').pipe(
                    map((getRes) => {
                        if (getRes.status !== 200) {
                            this.logger.debug(
                                DGTConnectorSolidWeb.name,
                                'Status was not 200',
                                getRes.status
                            );
                            return false;
                        } else {
                            this.logger.debug(
                                DGTConnectorSolidWeb.name,
                                'URL has a solid server',
                                url
                            );
                            // When the url passes all of the previous checks, it is granted 'solid-server' status
                            return true;
                        }
                    })
                )
            );
        }
    }
}
