import {
    DGTConnection,
    DGTConnectionSolid,
    DGTConnectionSolidConfiguration,
    DGTExchange,
    DGTSource,
    DGTSourceSolid,
    DGTSourceSolidConfiguration,
    DGTSourceState,
} from '@digita-ai/dgt-shared-data';
import {
    DGTCryptoService,
    DGTErrorArgument,
    DGTErrorNotImplemented,
    DGTHttpService,
    DGTInjectable,
    DGTLoggerService,
    DGTOriginService,
} from '@digita-ai/dgt-shared-utils';
import { JWT } from '@solid/jose';
import base64url from 'base64url';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTSourceSolidLogin } from '../models/dgt-source-solid-login.model';
import { DGTSourceSolidToken } from '../models/dgt-source-solid-token.model';

@DGTInjectable()
export class DGTSolidService {
    constructor(
        private logger: DGTLoggerService,
        private http: DGTHttpService,
        private crypto: DGTCryptoService,
        private origin: DGTOriginService,
    ) {}

    public generateUri(
        source: DGTSource<DGTSourceSolidConfiguration>,
        connection: DGTConnection<DGTConnectionSolidConfiguration>,
    ): Observable<string> {
        this.logger.debug(DGTSolidService.name, 'Starting to generate login uri', {
            source: source.configuration,
            connection,
        });
        // define basic elements of the request
        const issuer = source.configuration.issuer;
        const endpoint = source.configuration.authorization_endpoint;
        const client = { client_id: source.configuration.client_id };
        let params = Object.assign(
            {
                // response_type: 'code',
                response_type: 'id_token token',
                // display: 'popup',
                scope: 'openid profile email',
                redirect_uri: source.configuration.callbackUri,
                state: null,
                nonce: null,
                key: null,
            },
            client,
        );

        // generate state and nonce random octets
        params.state = this.crypto.generateRandomNumbers(16);
        params.nonce = this.crypto.generateRandomNumbers(16);

        return forkJoin(
            this.crypto.digest(new Uint8Array(params.state)),
            this.crypto.digest(new Uint8Array(params.nonce)),
        ).pipe(
            map((digests) => ({ digests })),
            tap((data) =>
                this.logger.debug(DGTSolidService.name, 'Generated digests', { data, params, source, connection }),
            ),
            map((data) => {
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
            tap((data) =>
                this.logger.debug(DGTSolidService.name, 'Generated nonce, state and key', {
                    data,
                    params,
                    source,
                    connection,
                }),
            ),
            switchMap((data) => this.crypto.generateKeyPair().pipe(map((sessionKeys) => ({ ...data, sessionKeys })))),
            tap((data) =>
                this.logger.debug(DGTSolidService.name, 'Generated session keys', { data, params, source, connection }),
            ),
            map((data) => {
                connection.configuration.privateKey = JSON.stringify(data.sessionKeys.privateKey);
                params.key = data.sessionKeys.publicKey;
            }),
            switchMap(() => {
                if (source.configuration.request_parameter_supported) {
                    const excludeParams = ['scope', 'client_id', 'response_type', 'state'];
                    const keysToEncode = Object.keys(params).filter((key) => !excludeParams.includes(key));
                    const payload = {};

                    keysToEncode.forEach((key) => {
                        payload[key] = params[key];
                    });

                    const requestParamJwt = new JWT(
                        {
                            header: { alg: 'none' },
                            payload,
                        },
                        { filter: false },
                    );

                    return from(
                        requestParamJwt
                            .encode()
                            .then((requestParamCompact) => {
                                const newParams = {
                                    scope: params.scope,
                                    client_id: params.client_id,
                                    response_type: params.response_type,
                                    request: requestParamCompact,
                                    state: params.state,
                                };

                                return newParams;
                            })
                            .then((encodedParams) => {
                                params = encodedParams;
                            }),
                    );
                }
            }),
            map(() => {
                const url = new URL(endpoint);
                url.search = this.encode(params);

                return url.href;
            }),
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

    private encode(data): string {
        const pairs = [];

        Object.keys(data).forEach((key) => {
            pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        });

        return pairs.join('&');
    }

    public checkAccessRights(exchange: DGTExchange): Observable<boolean> {
        throw new DGTErrorNotImplemented();
        // this.logger.debug(DGTSolidService.name, 'Checking access rights', { exchange });

        // return of(exchange).pipe(
        //     switchMap(data => this.purposes.get(exchange.purpose).pipe(
        //         map(purpose => ({ ...data, purpose })),
        //     )),
        //     switchMap(data => this.query<DGTSourceSolidTrustedApp>(exchange, this.transformer).pipe(
        //         map(trustedApps => ({ ...data, trustedApps })),
        //     )),
        //     tap(data => this.logger.debug(DGTSolidService.name, 'Retrieved trusted apps', data.trustedApps)),
        //     map(data => ({ ...data, ourTrustedApp: data.trustedApps.find(app => this.origin.get().includes(app.origin)) })),
        //     tap(data => this.logger.debug(DGTSolidService.name, 'Found our trusted app', data.ourTrustedApp)),
        //     map(data => {
        //         let res = false;
        //         const aclsNeeded: string[] = data.purpose.aclNeeded ? data.purpose.aclNeeded : [DGTSourceSolidTrustedAppMode.READ];

        //         if (data.ourTrustedApp && aclsNeeded.every(acl => data.ourTrustedApp.modes.includes(acl as DGTSourceSolidTrustedAppMode))) {
        //             res = true;
        //         }

        //         this.logger.debug(DGTSolidService.name, 'Checked if acl modes are included', { res, aclsNeeded, ourTrustedApp: data.ourTrustedApp })

        //         return res;
        //     }),
        // );
    }

    /**
     * Check if a solid server is running on the given url
     * @param url url to test
     * @returns true if the specified url is a solid server, false if not
     */
    public isSolidServer(url: string): Observable<boolean> {
        if (!url) {
            this.logger.debug(DGTSolidService.name, 'URL was undefined or null', url);
            return of(false);
        }
        // Test if url is valid
        // Copyright (c) 2010-2018 Diego Perini (http://www.iport.it)
        const reg = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
        if (!reg.test(url)) {
            this.logger.debug(DGTSolidService.name, 'URL was not valid', url);
            return of(false);
        } else {
            // Check headers for Link
            return (
                this.http.head(url).pipe(
                    map((res) => {
                        const headers = res.headers;
                        if (res.status !== 200) {
                            this.logger.debug(DGTSolidService.name, 'Status was not 200', res.status);
                            return false;
                        } else if (!headers.has('link')) {
                            this.logger.debug(DGTSolidService.name, 'Headers did not contain Link', headers);
                            return false;
                        } else if (
                            headers.get('link') !==
                            '<.acl>; rel="acl", <.meta>; rel="describedBy", <http://www.w3.org/ns/ldp#Resource>; rel="type"'
                        ) {
                            this.logger.debug(
                                DGTSolidService.name,
                                'Link header value did not match',
                                headers.get('link'),
                            );
                            return false;
                        } else {
                            return true;
                        }
                    }),
                ) &&
                // Check if /.well-known/openid-configuration exists on server
                this.http.get(url + '/.well-known/openid-configuration').pipe(
                    map((getRes) => {
                        if (getRes.status !== 200) {
                            this.logger.debug(DGTSolidService.name, 'Status was not 200', getRes.status);
                            return false;
                        } else {
                            this.logger.debug(DGTSolidService.name, 'URL has a solid server', url);
                            // When the url passes all of the previous checks, it is granted 'solid-server' status
                            return true;
                        }
                    }),
                )
            );
        }
    }

    public prepare(source: DGTSourceSolid): Observable<DGTSourceSolid> {
        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        this.logger.debug(DGTSolidService.name, 'Starting to prepare source for connection', { source });

        return of({ source }).pipe(
            switchMap((data) =>
                this.discover(data.source).pipe(
                    map((configuration) => ({
                        ...data,
                        source: { ...data.source, configuration: { ...data.source.configuration, ...configuration } },
                    })),
                ),
            ),
            switchMap((data) =>
                this.jwks(data.source).pipe(
                    map((configuration) => ({
                        ...data,
                        source: { ...data.source, configuration: { ...data.source.configuration, ...configuration } },
                    })),
                ),
            ),
            switchMap((data) =>
                this.register(data.source).pipe(
                    map((configuration) => ({
                        ...data,
                        source: {
                            ...data.source,
                            state: DGTSourceState.PREPARED,
                            configuration: { ...data.source.configuration, ...configuration },
                        },
                    })),
                ),
            ),
            tap((src) => this.logger.debug(DGTSolidService.name, 'Prepared source for connection', { src })),
            map((data) => data.source),
        );
    }

    private discover(source: DGTSourceSolid): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTSolidService.name, 'Discovering source', {
            source,
        });

        const url = `${source.configuration.issuer}/.well-known/openid-configuration`;

        return this.http.get<DGTSourceSolidConfiguration>(url).pipe(
            tap((response) => this.logger.debug(DGTSolidService.name, 'Received discover response', { response })),
            map((response) => ({ ...source.configuration, ...response.data })),
        );
    }

    private jwks(source: DGTSourceSolid): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTSolidService.name, 'Retrieve JWK set', {
            source,
        });

        const url = `${source.configuration.jwks_uri}`;

        return this.http.get<any>(url).pipe(
            tap((response) => this.logger.debug(DGTSolidService.name, 'Received jwks response', { response })),
            map((response) => ({ ...source.configuration, keys: response.data.keys })),
        );
    }

    private register(source: DGTSourceSolid): Observable<DGTSourceSolidConfiguration> {
        this.logger.debug(DGTSolidService.name, 'Registering client', {
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
            redirect_uris: [encodedCallbackUri],
        };
        const body = JSON.stringify(Object.assign({}, params, {}));

        return this.http.post<DGTSourceSolidConfiguration>(uri, body, headers).pipe(
            tap((response) =>
                this.logger.debug(DGTSolidService.name, 'Received registration response', { response, source }),
            ),
            map((response) => ({ ...source.configuration, ...response.data })),
        );
    }

    public generateToken(uri, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<string> {
        if (source.state !== DGTSourceState.PREPARED) {
            throw new DGTErrorArgument('The source should be prepared before trying to generate a token', source);
        }

        return DGTSourceSolidToken.issueFor(
            uri,
            connection.configuration.privateKey,
            source.configuration.client_id,
            connection.configuration.idToken,
        );
    }

    /**
     * Registers an account on a solid server
     * @param source source to create account on
     * @param loginData data to use to create the account
     * @returns the http response
     */
    registerAccount(source: DGTSourceSolid, loginData: DGTSourceSolidLogin): Observable<any> {
        this.logger.debug(DGTSolidService.name, 'Registering account', {
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
                this.logger.debug(DGTSolidService.name, 'Received registration response', { response, source }),
            ),
            map((response) => ({ response, ...source.configuration })),
        );
    }

    /**
     * This function will check if a specific username is already taken
     * on a specific solid server
     * @param source The source you want to check the username on
     * @param username The username you want to check for existance
     * @returns True if the username is available, false if not
     */
    public isAvailableUsername(source: DGTSourceSolid, username: string): Observable<boolean> {
        this.logger.debug(DGTSolidService.name, 'Checking if username exists on solid server', { source, username });

        const sourceuri = source.configuration.issuer;
        const url = 'https://' + username + '.' + sourceuri.split('//')[1];

        return this.http.head<DGTSourceSolidConfiguration>(url).pipe(
            tap((response) =>
                this.logger.debug(DGTSolidService.name, 'Received response', {
                    response,
                }),
            ),
            map((response) => response.status === 404),
        );
    }
}
