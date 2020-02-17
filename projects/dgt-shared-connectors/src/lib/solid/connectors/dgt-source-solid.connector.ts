import { Observable, of, forkJoin, from } from 'rxjs';
import { DGTProvider, DGTSourceConnector, DGTExchange, DGTJustification, DGTLDResponse, DGTSource, DGTSourceSolidConfiguration, DGTProviderSolidConfiguration, DGTSourceType, DGTDataService, DGTSourceSolid, DGTProviderState, DGTProviderSolid } from '@digita/dgt-shared-data';
import { DGTLDService } from '../../linked-data/services/dgt-ld.service';
import { Injectable } from '@angular/core';
import { DGTLoggerService, DGTHttpService } from '@digita/dgt-shared-utils';
import { switchMap, map, tap } from 'rxjs/operators';
import { JWT } from '@solid/jose';
import base64url from 'base64url';

@Injectable()
export class DGTSourceSolidConnector implements DGTSourceConnector<DGTSourceSolidConfiguration, DGTProviderSolidConfiguration> {
    constructor(private linked: DGTLDService, private logger: DGTLoggerService, private data: DGTDataService, private http: DGTHttpService) { }

    connect(justification: DGTJustification, exchange: DGTExchange, provider: DGTProvider<DGTProviderSolidConfiguration>, source: DGTSource<DGTSourceSolidConfiguration>): Observable<DGTProvider<DGTProviderSolidConfiguration>> {
        this.logger.debug(DGTSourceSolidConnector.name, 'Starting to connect to Solid', { provider, source });

        let res: Observable<DGTProvider<any>> = null;

        if (source && source.type === DGTSourceType.SOLID) {
            res = of({ provider, source })
                .pipe(
                    switchMap(data => this.discover(data.source)
                        .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
                    switchMap(data => this.jwks(data.source)
                        .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
                    switchMap(data => this.register(data.source, data.provider)
                        .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
                    switchMap(data => this.data.updateEntity('source', data.source)
                        .pipe(map(savedSource => ({ ...data, source: savedSource })))),
                    tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Updated source configuration', { data })),
                    switchMap(data => this.generateUri(data.source, data.provider)
                        .pipe(
                            map(loginUri => ({
                                ...data,
                                provider: {
                                    ...provider,
                                    configuration: { ...data.provider.configuration, loginUri },
                                    state: DGTProviderState.CONNECTING
                                },
                            })),
                        )),
                    switchMap(data => this.data.updateEntity('provider', data.provider)
                        .pipe(map(savedProvider => ({ ...data, provider: savedProvider })))),
                    map(data => data.provider)
                );
        }

        return res;
    }

    public query(justification: DGTJustification, exchange: DGTExchange, provider: DGTProvider<DGTProviderSolidConfiguration>, source: DGTSource<DGTSourceSolidConfiguration>): Observable<DGTLDResponse> {
        return this.linked.query(provider.configuration.webId, provider.configuration.accessToken, exchange, justification, source, provider);
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

    private register(source: DGTSourceSolid, provider: DGTProviderSolid): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTSourceSolidConnector.name, 'Registering client', { source });

        const encodedCallbackUri = provider.configuration.callbackUri;
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

    private generateUri(source: DGTSourceSolid, provider: DGTProviderSolid): Observable<string> {
        this.logger.debug(DGTSourceSolidConnector.name, 'Starting to generate login uri', { source, provider });
        // define basic elements of the request
        const issuer = source.configuration.issuer;
        const endpoint = source.configuration.authorization_endpoint;
        const client = { client_id: source.configuration.client_id };
        let params = Object.assign({
            // response_type: 'code',
            response_type: 'id_token token',
            // display: 'popup',
            scope: 'openid profile email',
            redirect_uri: provider.configuration.callbackUri,
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
                tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Generated digests', { data, params, source, provider })),
                map(data => {
                    const state = base64url(Buffer.from(data.digests[0]));
                    const nonce = base64url(Buffer.from(data.digests[1]));
                    const key = `${issuer}/requestHistory/${state}`;

                    // store the request params for response validation
                    // with serialized octet values for state and nonce
                    provider.configuration.requestHistory = {};
                    provider.configuration.requestHistory[key] = JSON.stringify(params);

                    // replace state and nonce octets with base64url encoded digests
                    params.state = state;
                    params.nonce = nonce;

                    return data;
                }),
                tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Generated nonce, state and key', { data, params, source, provider })),
                switchMap(data => this.generateSessionKeys()
                    .pipe(map(sessionKeys => ({ ...data, sessionKeys })))),
                tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Generated session keys', { data, params, source, provider })),
                map(data => {
                    provider.configuration.privateKey = JSON.stringify(data.sessionKeys.private);
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

    public retrieveWebId(provider: DGTProviderSolid): string {
        let res = null;

        if (provider && provider.configuration && provider.configuration.idToken) {
            const decoded = JWT.decode(provider.configuration.idToken);

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
}
