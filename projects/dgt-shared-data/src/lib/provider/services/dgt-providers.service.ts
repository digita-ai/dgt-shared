import { DGTProvider } from '../models/dgt-provider.model';
import { Injectable } from '@angular/core';
import { DGTLoggerService, DGTHttpService } from '@digita/dgt-shared-utils';
import { Observable, from, of, forkJoin } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { DGTProviderSolid } from '../models/dgt-provider-solid.model';
import * as _ from 'lodash';
import { JWT } from '@solid/jose';
import base64url from 'base64url';
import { DGTProviderState } from '../models/dgt-provider-state.model';
import { Buffer } from 'buffer';
import { DGTDataService } from '../../metadata/services/dgt-data.service';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTSourceType } from '../../source/models/dgt-source-type.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';
import { DGTSourceSolidConfiguration } from '../../source/models/dgt-source-solid-configuration.model';

@Injectable()
export class DGTProvidersService {
    constructor(private logger: DGTLoggerService, private data: DGTDataService, private http: DGTHttpService) {

    }

    public connect(provider: DGTProvider<any>, source: DGTSource<any>, callbackUri: string): Observable<DGTProvider<any>> {
        this.logger.debug(DGTProvidersService.name, 'Starting to connect to source', { source });

        let res: Observable<DGTProvider<any>> = null;

        if (source && source.type === DGTSourceType.SOLID) {
            res = this.connectToSolid(provider, source, callbackUri);
        }

        return res;
    }

    private connectToSolid(provider: DGTProviderSolid, source: DGTSourceSolid, callbackUri: string): Observable<DGTProviderSolid> {
        this.logger.debug(DGTProvidersService.name, 'Starting to connect to Solid', { provider, source, callbackUri });

        let res: Observable<DGTProvider<any>> = null;

        if (source) {
            res = of({ provider, source, callbackUri })
                .pipe(
                    switchMap(data => this.discover(data.source)
                        .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
                    switchMap(data => this.jwks(data.source)
                        .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
                    switchMap(data => this.register(data.source, data.callbackUri)
                        .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
                    switchMap(data => this.data.updateEntity('source', data.source)
                        .pipe(map(savedSource => ({ ...data, source: savedSource })))),
                    tap(data => this.logger.debug(DGTProvidersService.name, 'Updated source configuration', { data })),
                    switchMap(data => this.generateUri(data.source, data.provider, data.callbackUri)
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

    public get(providers: DGTProvider<any>[]): Observable<DGTLDValue[]> {
        this.logger.debug(DGTProvidersService.name, 'Starting to get data from providers', { providers });

        return of(providers)
            .pipe(
                switchMap(data => forkJoin(providers.map(provider => {
                    let res: Observable<DGTLDValue[]> = of([]);

                    if (provider) {
                        // Plus check type

                        res = this.getSolid(provider);
                    }

                    return res;
                }))),
                map(data => _.flatten(data))
            );
    }

    private getSolid(provider: DGTProviderSolid): Observable<DGTLDValue[]> {
        this.logger.debug(DGTProvidersService.name, 'Starting to get data from Solid provider', { provider });

        return this.http.get(provider.configuration.webId, {
            Authorization: 'Bearer ' + provider.configuration.accessToken
        })
            .pipe(
                tap(data => this.logger.debug(DGTProvidersService.name, 'Received ressponse from provider', { data })),
                map(data => [])
            );
    }

    private discover(source: DGTSourceSolid): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTProvidersService.name, 'Discovering source', { source });

        const url = `${source.configuration.issuer}/.well-known/openid-configuration`;

        return this.http.get<DGTSourceSolidConfiguration>(url)
            .pipe(
                tap(response => this.logger.debug(DGTProvidersService.name, 'Received discover response', { response })),
                map(response => ({ ...response.data, ...source.configuration })),
            );
    }

    private jwks(source: DGTSourceSolid): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTProvidersService.name, 'Retrieve JWK set', { source });

        const url = `${source.configuration.jwks_uri}`;

        return this.http.get<any>(url)
            .pipe(
                tap(response => this.logger.debug(DGTProvidersService.name, 'Received jwks response', { response })),
                map(response => ({ keys: response.data.keys, ...source.configuration })),
            );
    }

    private register(source: DGTSourceSolid, callbackUri: string): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTProvidersService.name, 'Registering client', { source });

        const encodedCallbackUri = callbackUri;
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
                tap(response => this.logger.debug(DGTProvidersService.name, 'Received registration response', { response, source })),
                map(response => ({ ...response.data, ...source.configuration })),
            );
    }

    private generateUri(source: DGTSourceSolid, provider: DGTProviderSolid, callbackUri: string): Observable<string> {
        this.logger.debug(DGTProvidersService.name, 'Starting to generate login uri', { source, provider, callbackUri });
        // define basic elements of the request
        const issuer = source.configuration.issuer;
        const endpoint = source.configuration.authorization_endpoint;
        const client = { client_id: source.configuration.client_id };
        let params = Object.assign({
            // response_type: 'code',
            response_type: 'id_token token',
            // display: 'popup',
            scope: 'openid profile email',
            redirect_uri: callbackUri,
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
                tap(data => this.logger.debug(DGTProvidersService.name, 'Generated digests', { data, params, source, provider, callbackUri })),
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
                tap(data => this.logger.debug(DGTProvidersService.name, 'Generated nonce, state and key', { data, params, source, provider, callbackUri })),
                switchMap(data => this.generateSessionKeys()
                    .pipe(map(sessionKeys => ({ ...data, sessionKeys })))),
                tap(data => this.logger.debug(DGTProvidersService.name, 'Generated session keys', { data, params, source, provider, callbackUri })),
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
