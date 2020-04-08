import { Observable, of, forkJoin, from } from 'rxjs';
import { DGTConnection, DGTSourceConnector, DGTExchange, DGTJustification, DGTSource, DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration, DGTSourceType, DGTDataService, DGTSourceSolid, DGTConnectionState, DGTConnectionSolid, DGTLDNode, DGTLDTriple, DGTLDEntity, DGTLDTermType, DGTLDTransformer, DGTLDDataType } from '@digita/dgt-shared-data';
import { Injectable } from '@angular/core';
import { DGTLoggerService, DGTHttpService } from '@digita/dgt-shared-utils';
import { switchMap, map, tap } from 'rxjs/operators';
import { JWT } from '@solid/jose';
import base64url from 'base64url';
import { N3Parser, Quad, Parser } from 'n3';
import { Generator, SparqlQuery, Update, Triple, Term } from 'sparqljs';
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';

@Injectable()
export class DGTSourceSolidConnector implements DGTSourceConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration> {
    private parser: N3Parser<Quad> = new Parser();

    constructor(private logger: DGTLoggerService, private data: DGTDataService, private http: DGTHttpService) { }

    connect(justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<DGTConnectionSolidConfiguration>, source: DGTSource<DGTSourceSolidConfiguration>): Observable<DGTConnection<DGTConnectionSolidConfiguration>> {
        this.logger.debug(DGTSourceSolidConnector.name, 'Starting to connect to Solid', { connection, source });

        let res: Observable<DGTConnection<any>> = null;

        if (source && source.type === DGTSourceType.SOLID) {
            res = of({ connection, source })
                .pipe(
                    switchMap(data => this.discover(data.source)
                        .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
                    switchMap(data => this.jwks(data.source)
                        .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
                    switchMap(data => this.register(data.source, data.connection)
                        .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
                    switchMap(data => this.data.updateEntity('source', data.source)
                        .pipe(map(savedSource => ({ ...data, source: savedSource })))),
                    tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Updated source configuration', { data })),
                    switchMap(data => this.generateUri(data.source, data.connection)
                        .pipe(
                            map(loginUri => ({
                                ...data,
                                connection: {
                                    ...connection,
                                    configuration: { ...data.connection.configuration, loginUri },
                                    state: DGTConnectionState.CONNECTING,
                                },
                            })),
                        )),
                    switchMap(data => this.data.updateEntity('connection', data.connection)
                        .pipe(map(savedProvider => ({ ...data, connection: savedProvider })))),
                    map(data => data.connection)
                );
        }

        return res;
    }

    public query<T extends DGTLDEntity>(documentUri: string, justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<DGTConnectionSolidConfiguration>, source: DGTSource<DGTSourceSolidConfiguration>, transformer: DGTLDTransformer<T> = null): Observable<T> {
        const uri = documentUri ? documentUri : connection.configuration.webId;

        this.logger.debug(DGTSourceSolidConnector.name, 'Starting to query linked data service', { endpoint: uri, exchange, justification });

        return this.http.get<string>(uri, {
            Authorization: 'Bearer ' + connection.configuration.accessToken
        }, true)
            .pipe(
                tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Received response from connection', { data })),
                map(data => this.convert(data.data, uri, exchange, source, connection)),
                tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Parsed values', { data })),
                map(triples =>
                    ({
                        triples,
                        connection: connection.id,
                        source: source.id,
                        documentUri,
                        subject: {
                            value: uri,
                            termType: DGTLDTermType.REFERENCE
                        },
                    }),
                ),
                switchMap((entity: DGTLDEntity) => transformer ? transformer.toDomain(entity) : (of(entity as T)))
            );
    }

    public add(entity: DGTLDEntity, connection: DGTConnectionSolid): Observable<DGTLDEntity> {
        this.logger.debug(DGTSourceSolidConnector.name, 'Starting to add entity', { entity, connection });

        const body = this.addGenerateSparql(entity);

        this.logger.debug(DGTSourceSolidConnector.name, 'Constructed body', { body, entity, connection });

        return this.http.patch(entity.subject.value, body, {
            'Content-Type': 'application/sparql-update',
            Authorization: 'Bearer ' + connection.configuration.accessToken
        })
            .pipe(map(response => entity));
    }

    private addGenerateSparql(entity: DGTLDEntity): string {

        this.logger.debug(DGTSourceSolidConnector.name, 'Starting to generate SparQL for delete.', { entity });

        const triples: Triple[] = entity.triples.map<Triple>(triple => {
            let object: Term = `${triple.object.value}` as Term;

            if (triple.object.termType === DGTLDTermType.LITERAL) {
                object = `"${triple.object.value}"^^${triple.object.dataType}` as Term;
            }

            return {
                subject: triple.subject.value as Term,
                predicate: `${triple.predicate.namespace}${triple.predicate.name}` as Term,
                object
            };
        });

        this.logger.debug(DGTSourceSolidConnector.name, 'Parsed triples.', { entity, triples });

        const query: Update = {
            type: 'update',
            // prefixes: { [prefix: string]: string; },
            prefixes: {
                // xsd: 'http://www.w3.org/2001/XMLSchema#'
            },
            updates: [
                {
                    updateType: 'insert',
                    insert: [
                        {
                            type: 'bgp',
                            triples
                        }
                    ]
                }
            ]
        };

        this.logger.debug(DGTSourceSolidConnector.name, 'Created query object.', { query, entity, triples });

        const generator = new Generator();
        const body = generator.stringify(query);

        this.logger.debug(DGTSourceSolidConnector.name, 'Created query string.', { body, query, entity, triples });

        return body;
    }

    public delete(entities: DGTLDEntity[], connection: DGTConnectionSolid): Observable<DGTLDEntity[]> {
        this.logger.debug(DGTSourceSolidConnector.name, 'Starting to delete entity', { entities, connection });

        if (entities) {
            const body = this.deleteGenerateSparql(entities);
            this.logger.debug(DGTSourceSolidConnector.name, 'Constructed body', { body, entities, connection });
            this.logger.debug(DGTSourceSolidConnector.name, 'Constructed body 2', entities[0].documentUri);

            return this.http.patch(entities[0].documentUri, body, {
                'Content-Type': 'application/sparql-update',
                Authorization: 'Bearer ' + connection.configuration.accessToken
            }).pipe(map(res => entities));
        }
    }

    private deleteGenerateSparql(entities: DGTLDEntity[]): string {

        this.logger.debug(DGTSourceSolidConnector.name, 'Starting to generate SparQL for delete.', { entities });

        const triples: Triple[] = _.flatMap(entities, (entity: DGTLDEntity) => {
            this.logger.log('debug', DGTSourceSolidConnector.name, 'entity: ', triples);
            return entity.triples.map<Triple>(triple => {
                let object: Term = `${triple.object.value}` as Term;

                if (triple.object.termType === DGTLDTermType.LITERAL) {
                    object = `"${triple.object.value}"^^${triple.object.dataType}` as Term;
                }

                return {
                    subject: triple.subject.value as Term,
                    predicate: `${triple.predicate.namespace}${triple.predicate.name}` as Term,
                    object
                };
            });
        });

        this.logger.debug(DGTSourceSolidConnector.name, 'Parsed triples.', { entities, triples });

        const query: Update = {
            type: 'update',
            // prefixes: { [prefix: string]: string; },
            prefixes: {
                // xsd: 'http://www.w3.org/2001/XMLSchema#'
            },
            updates: [
                {
                    updateType: 'delete',
                    delete: [
                        {
                            type: 'bgp',
                            triples
                        }
                    ]
                }
            ]
        };

        this.logger.debug(DGTSourceSolidConnector.name, 'Created query object.', { query, entities, triples });

        const generator = new Generator();
        const body = generator.stringify(query);

        this.logger.debug(DGTSourceSolidConnector.name, 'Created query string.', { body, query, entities, triples });

        return body;
    }

    private discover(source: DGTSourceSolid): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTSourceSolidConnector.name, 'Discovering source', { source });

        const url = `${source.configuration.issuer}/.well-known/openid-configuration`;

        return this.http.get<DGTSourceSolidConfiguration>(url)
            .pipe(
                tap(response => this.logger.debug(DGTSourceSolidConnector.name, 'Received discover response', { response })),
                map(response => ({ ...response.data, ...source.configuration })),
            );
    }

    private jwks(source: DGTSourceSolid): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTSourceSolidConnector.name, 'Retrieve JWK set', { source });

        const url = `${source.configuration.jwks_uri}`;

        return this.http.get<any>(url)
            .pipe(
                tap(response => this.logger.debug(DGTSourceSolidConnector.name, 'Received jwks response', { response })),
                map(response => ({ keys: response.data.keys, ...source.configuration })),
            );
    }

    private register(source: DGTSourceSolid, connection: DGTConnectionSolid): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTSourceSolidConnector.name, 'Registering client', { source });

        const encodedCallbackUri = connection.configuration.callbackUri;
        const uri = `${source.configuration.registration_endpoint}`;
        const headers = { 'Content-Type': 'application/json' };
        const params = {
            client_name: 'Digita Consumer Client',
            client_uri: 'http://localhost:4200',
            logo_uri: 'http://localhost:4200/assets/images/logo.png',
            response_types: ['code', 'code id_token token'],
            grant_types: ['authorization_code'],
            default_max_age: 7200,
            post_logout_redirect_uris: ['https://localhost:4200/connect/logout'],
            redirect_uris: [encodedCallbackUri]
        };
        const body = JSON.stringify(Object.assign({}, params, {}));

        return this.http.post<DGTSourceSolidConfiguration>(uri, body, headers)
            .pipe(
                tap(response => this.logger.debug(DGTSourceSolidConnector.name, 'Received registration response', { response, source })),
                map(response => ({ ...response.data, ...source.configuration })),
            );
    }

    private generateUri(source: DGTSourceSolid, connection: DGTConnectionSolid): Observable<string> {
        this.logger.debug(DGTSourceSolidConnector.name, 'Starting to generate login uri', { source, connection });
        // define basic elements of the request
        const issuer = source.configuration.issuer;
        const endpoint = source.configuration.authorization_endpoint;
        const client = { client_id: source.configuration.client_id };
        let params = Object.assign({
            // response_type: 'code',
            response_type: 'id_token token',
            // display: 'popup',
            scope: 'openid profile email',
            redirect_uri: connection.configuration.callbackUri,
            state: null,
            nonce: null,
            key: null
        }, client);

        // generate state and nonce random octets
        params.state = Array.from(crypto.getRandomValues(new Uint8Array(16)));
        params.nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)));

        return forkJoin(
            crypto.subtle.digest({ name: 'SHA-256' }, new Uint8Array(params.state)),
            crypto.subtle.digest({ name: 'SHA-256' }, new Uint8Array(params.nonce))
        )
            .pipe(
                map(digests => ({ digests })),
                tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Generated digests', { data, params, source, connection })),
                map(data => {
                    const state = base64url(Buffer.from(data.digests[0]));
                    const nonce = base64url(Buffer.from(data.digests[1]));
                    const key = `${issuer}/requestHistory/${state}`;

                    // store the request params for response validation
                    // with serialized octet values for state and nonce
                    connection.configuration.requestHistory = {};
                    connection.configuration.requestHistory[key] = JSON.stringify(params);

                    // replace state and nonce octets with base64url encoded digests
                    params.state = state;
                    params.nonce = nonce;

                    return data;
                }),
                tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Generated nonce, state and key', { data, params, source, connection })),
                switchMap(data => this.generateSessionKeys()
                    .pipe(map(sessionKeys => ({ ...data, sessionKeys })))),
                tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Generated session keys', { data, params, source, connection })),
                map(data => {
                    connection.configuration.privateKey = JSON.stringify(data.sessionKeys.private);
                    params.key = data.sessionKeys.public;
                }),
                switchMap(data => {
                    if (source.configuration.request_parameter_supported) {
                        const excludeParams = ['scope', 'client_id', 'response_type', 'state'];
                        const keysToEncode = Object.keys(params).filter(key => !excludeParams.includes(key));
                        const payload = {};

                        keysToEncode.forEach(key => {
                            payload[key] = params[key];
                        });

                        const requestParamJwt = new JWT({
                            header: { alg: 'none' },
                            payload
                        }, { filter: false });

                        return from(requestParamJwt.encode()
                            .then(requestParamCompact => {
                                const newParams = {
                                    scope: params.scope,
                                    client_id: params.client_id,
                                    response_type: params.response_type,
                                    request: requestParamCompact,
                                    state: params.state
                                };

                                return newParams;
                            })
                            .then(encodedParams => { params = encodedParams; }));
                    }
                }),
                map(data => {
                    const url = new URL(endpoint);
                    url.search = this.encode(params);

                    return url.href;
                })
            );
    }

    public retrieveWebId(connection: DGTConnectionSolid): string {
        let res = null;

        if (connection && connection.configuration && connection.configuration.idToken) {
            const decoded = JWT.decode(connection.configuration.idToken);

            res = decoded.payload.sub;
        }

        return res;
    }

    private generateSessionKeys(): Observable<{ public: JsonWebKey, private: JsonWebKey }> {

        return from(crypto.subtle.generateKey(
            {
                name: 'RSASSA-PKCS1-v1_5',
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: { name: 'SHA-256' },
            },
            true,
            ['sign', 'verify']
        ))
            .pipe(
                switchMap(data => forkJoin(
                    crypto.subtle.exportKey('jwk', data.publicKey),
                    crypto.subtle.exportKey('jwk', data.privateKey)
                )),
                map(data => {
                    const [publicJwk, privateJwk] = data;

                    return { public: publicJwk, private: privateJwk };
                })
            );
    }

    private encode(data): string {
        const pairs = [];

        Object.keys(data).forEach((key) => {
            pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        });

        return pairs.join('&');
    }

    public convert(response: string, documentUri: string, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple[] {
        let res: DGTLDTriple[] = null;

        const quads = this.parser.parse(response);
        this.logger.debug(DGTSourceSolidConnector.name, 'Parsed quads', { quads });

        if (quads) {
            this.logger.debug(DGTSourceSolidConnector.name, 'Starting to convert quads to values', { quads, webId: documentUri });
            res = quads.map(quad => this.convertOne(documentUri, quad, exchange, source, connection));
            res = res.map(value => ({
                ...value, subject: value.subject.value === '#me' ?
                    value.subject : value.subject
                // { value: webId, type: DGTLDTermType.REFERENCE } : value.subject
            }));
            res = this.clean(res);
        }

        return res;
    }

    private convertOne(documentUri: string, quad: Quad, exchange: DGTExchange, source: DGTSource<any>, connection: DGTConnection<any>): DGTLDTriple {
        const predicateSplit = quad.predicate.value.split('#');

        const subject = this.convertOneSubject(documentUri, quad, connection);
        const object = this.convertOneObject(documentUri, quad);

        return {
            id: uuid(),
            exchange: exchange ? exchange.id : null,
            connection: connection ? connection.id : null,
            predicate: {
                name: predicateSplit && predicateSplit.length === 2 ? predicateSplit[1] : null,
                namespace: predicateSplit && predicateSplit.length === 2 ? predicateSplit[0] + '#' : null,
            },
            subject,
            object,
            originalValue: object,
            source: source ? source.id : null
        };
    }

    private convertOneSubject(documentUri: string, quad: Quad, connection: DGTConnectionSolid): DGTLDNode {
        let subject: DGTLDNode = { value: quad.subject.value, termType: DGTLDTermType.REFERENCE };
        if (subject && subject.value && subject.value.startsWith('#me')) {
            // const me = connection.configuration.webId.split('/profile/card#me')[0];

            subject = {
                value: `${documentUri}`,
                termType: DGTLDTermType.REFERENCE
            };
        } else if (subject && subject.value && subject.value.startsWith('#')) {
            subject = {
                value: `${documentUri}#${quad.subject.value.split('#')[1]}`,
                termType: DGTLDTermType.REFERENCE
            };
        }

        return subject;
    }

    private convertOneObject(documentUri: string, quad: Quad): DGTLDNode {
        let res = null;

        if (quad.object.termType === 'Literal') {
            res = {
                dataType: quad.object.datatypeString,
                value: quad.object.value,
                type: DGTLDTermType.LITERAL
            };
        } else {
            if (quad.object.value.startsWith('#')) {
                res = {
                    value: documentUri + quad.object.value,
                    type: DGTLDTermType.REFERENCE
                };
            } else {
                res = {
                    value: quad.object.value,
                    type: DGTLDTermType.REFERENCE
                };
            }
        }


        return res;
    }

    private clean(values: DGTLDTriple[]): DGTLDTriple[] {
        return values
            .map(value => {
                const updatedValue = value;
                const stringValue = (value.object.value as string);

                if (value && stringValue.startsWith('undefined/')) {
                    const stringValueSplit = stringValue.split('undefined/')[1];
                    const stringSubjectBase = value.subject.value.split('/profile/card#me')[0];

                    updatedValue.object.value = stringSubjectBase + '/' + stringValueSplit;
                }

                return updatedValue;
            });
    }
}
