import { DGTConnection, DGTConnectionService, DGTConnectionSolid, DGTConnectionSolidConfiguration, DGTConnectionState, DGTConnector, DGTExchange, DGTExchangeService, DGTLDRepresentationSparqlDeleteFactory, DGTLDRepresentationSparqlInsertFactory, DGTLDResource, DGTLDTransformer, DGTLDTripleFactoryService, DGTLDTypeRegistration, DGTLDTypeRegistrationTransformerService, DGTPurpose, DGTPurposeService, DGTSource, DGTSourceService, DGTSourceSolid, DGTSourceSolidConfiguration, DGTSourceState, DGTSparqlQueryService, DGTUriFactoryService } from '@digita-ai/dgt-shared-data';
import { DGTCryptoService, DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService, DGTOriginService, DGTSourceSolidToken } from '@digita-ai/dgt-shared-utils';
import { JWT } from '@solid/jose';
import base64url from 'base64url';
import * as _ from 'lodash';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTSourceSolidLogin } from '../models/dgt-source-solid-login.model';
import { DGTSourceSolidTrustedAppMode } from '../models/dgt-source-solid-trusted-app-mode.model';
import { DGTSourceSolidTrustedApp } from '../models/dgt-source-solid-trusted-app.model';
import { DGTSourceSolidTrustedAppTransformerService } from '../services/dgt-source-solid-trusted-app-transformer.service';

@DGTInjectable()
export class DGTConnectorSolid extends DGTConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration> {

  constructor(
    private logger: DGTLoggerService,
    private http: DGTHttpService,
    private origin: DGTOriginService,
    private crypto: DGTCryptoService,
    private transformer: DGTSourceSolidTrustedAppTransformerService,
    private triples: DGTLDTripleFactoryService,
    private connections: DGTConnectionService,
    private purposes: DGTPurposeService,
    private sources: DGTSourceService,
    private exchanges: DGTExchangeService,
    private uris: DGTUriFactoryService,
    private toSparqlInsert: DGTLDRepresentationSparqlInsertFactory,
    private toSparqlDelete: DGTLDRepresentationSparqlDeleteFactory,
    private typeRegistrationsTransformer: DGTLDTypeRegistrationTransformerService,
  ) {
    super();
  }

  private add<T extends DGTLDResource>(resources: T[], transformer: DGTLDTransformer<T>): Observable<T[]> {
    this.logger.debug(DGTConnectorSolid.name, 'Starting to add entity', { domainEntities: resources });

    return of({ resources, transformer })
      .pipe(
        switchMap(data => this.exchanges.get(_.head(resources).exchange)
          .pipe(map(exchange => ({ ...data, exchange })))),
        switchMap(data => of(resources)
          .pipe(
            tap(triples => {
              if (!triples) {
                throw new DGTErrorArgument(DGTConnectorSolid.name, 'No triples created by transformer');
              }
            }),
            map(entities => ({ ...data, entities, groupedEntities: _.groupBy(entities, 'uri'), domainEntities: resources })),
          ),
        ),
        tap(data => this.logger.debug(DGTConnectorSolid.name, 'Prepared to add resource', data)),
        switchMap(data => this.connections.get(data.exchange.connection)
          .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection })))),
        switchMap(data => this.sources.get(data.exchange.source)
          .pipe(map(source => ({ ...data, source })))),
        switchMap(data => forkJoin(Object.keys(data.groupedEntities).map(uri => this.generateToken(uri, data.connection, data.source)
          .pipe(
            map(token => ({
              headers: token ? { 'Content-Type': 'application/sparql-update', Authorization: 'Bearer ' + token } : { 'Content-Type': 'application/sparql-update' },
            })),
            switchMap(d => this.toSparqlInsert.serialize(data.groupedEntities[uri], data.transformer)
              .pipe(map(serialized => ({ ...d, serialized })))),
            switchMap(d => this.http.patch(
              uri,
              d.serialized,
              d.headers,
            )),
          )),
        ).pipe(map((response) => data.entities as T[])),
        ),
      );
  }

  public query<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
    this.logger.debug(DGTConnectorSolid.name, 'Starting to query linked data service', { exchange, transformer });

    if (!exchange) {
      throw new DGTErrorArgument('Argument exchange should be set.', exchange);
    }

    if (!transformer) {
      throw new DGTErrorArgument('Argument transformer should be set.', transformer);
    }

    return of({ exchange, transformer })
      .pipe(
        switchMap(data => this.connections.get(data.exchange.connection)
          .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection })))),
        tap(data => this.logger.debug(DGTConnectorSolid.name, 'Retrieved connetion', data)),
        switchMap(data => this.sources.get(data.exchange.source)
          .pipe(map(source => ({ ...data, source })))),
        tap(data => this.logger.debug(DGTConnectorSolid.name, 'Retrieved source', data)),
        switchMap(data => forkJoin(data.connection.configuration.typeRegistrations.map(typeRegistration => this.queryOne(typeRegistration.instance, data.exchange, data.connection, data.source, data.transformer)))
          .pipe(map(resources => ({ ...data, resources })))),
        switchMap(data => transformer.toDomain(data.resources)),
        tap(data => this.logger.debug(DGTConnectorSolid.name, 'Transformed resources', { data })),
      ) as Observable<T[]>;
  }

  public queryOne<T extends DGTLDResource>(uri: string, exchange: DGTExchange, connection: DGTConnectionSolid, source: DGTSourceSolid, transformer: DGTLDTransformer<T>): Observable<DGTLDResource> {
    this.logger.debug(DGTConnectorSolid.name, 'Starting to query linked data service', { exchange, transformer });

    if (!connection) {
      throw new DGTErrorArgument('Argument connection should be set.', connection);
    }

    if (!source) {
      throw new DGTErrorArgument('Argument source should be set.', source);
    }

    if (!transformer) {
      throw new DGTErrorArgument('Argument transformer should be set.', transformer);
    }

    if (!uri) {
      throw new DGTErrorArgument('Argument uri should be set.', uri);
    }

    if (!exchange) {
      throw new DGTErrorArgument('Argument exchange should be set.', exchange);
    }

    return of({ connection, source, transformer, uri, exchange })
      .pipe(
        switchMap(data => this.generateToken(data.uri, data.connection, data.source)
          .pipe(map(token => ({
            ...data, token, headers: token ? {
              'Accept': 'text/turtle',
              Authorization: 'Bearer ' + token,
            } : { 'Accept': 'text/turtle' },
          })))),
        tap(data => this.logger.debug(DGTConnectorSolid.name, 'Generated token', data)),
        switchMap(data => this.http.get<string>(data.uri, data.headers, true)
          .pipe(map(response => ({ ...data, response, triples: response.data ? this.triples.createFromString(response.data, data.uri) : [] })))),
        map(data => ({
          ...data, resource: {
            triples: data.triples,
            uri: data.uri,
            exchange: data.exchange.uri,
          },
        })),
        map(data => ({ ...data, resource: { ...data.resource, uri: this.uris.generate(data.resource, 'data') } })),
        tap(data => this.logger.debug(DGTConnectorSolid.name, 'Transformed resources', { data })),
        map(data => data.resource),
      );
  }

  public delete<T extends DGTLDResource>(domainEntities: T[], transformer: DGTLDTransformer<T>): Observable<T[]> {
    if (!domainEntities) {
      throw new DGTErrorArgument(
        'domainEntities should be set.',
        domainEntities,
      );
    }

    if (!transformer) {
      throw new DGTErrorArgument('transformer should be set.', transformer);
    }

    this.logger.debug(
      DGTSparqlQueryService.name,
      'Starting to delete entity',
      { domainEntities },
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
          data,
        ),
      ),
      switchMap((data) =>
        forkJoin(
          Object.keys(data.groupedEntities).map((uri) => {
            return this.generateToken(uri, data.connection, data.source).pipe(
              map(token => ({
                headers: token ? { 'Content-Type': 'application/sparql-update', Authorization: 'Bearer ' + token } : { 'Content-Type': 'application/sparql-update' },
              })),
              switchMap(d => this.toSparqlDelete.serialize(data.groupedEntities[uri], transformer)
                .pipe(map(serialized => ({ ...d, serialized })))),
              switchMap(d =>
                this.http.patch(
                  uri,
                  d.serialized,
                  d.headers,
                ),
              ),
            );
          }),
        ).pipe(map((response) => data.entities as T[])),
      ),
    );
  }

  public save<R extends DGTLDResource>(
    resources: R[],
    transformer: DGTLDTransformer<R>,
  ): Observable<R[]> {
    return of({ resources, transformer })
      .pipe(
        switchMap(data => this.update(resources.filter(r => r.uri !== null), data.transformer)
          .pipe(map(updated => ({ ...data, updated })))),
        switchMap(data => this.add(resources.filter(r => r.uri === null), data.transformer)
          .pipe(map(added => ({ ...data, added })))),
        map(data => [...data.added, ...data.updated]),
      )
  }

  private update<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<R[]> {
    if (!resources) {
      throw new DGTErrorArgument('Argument resources should be set.', resources);
    }

    if (!transformer) {
      throw new DGTErrorArgument('Argument transformer should be set.', transformer);
    }

    this.logger.debug(
      DGTSparqlQueryService.name,
      'Starting to update entity',
      { resources, transformer },
    );
    return of({ resources, transformer })
      .pipe(
        switchMap(data => forkJoin(
          data.resources.map((update) =>
            // transformer.toTriples([update.original]).pipe(
            //   map((uTransfored) => ({ ...update, original: uTransfored[0] })),
              // switchMap((u) =>
                transformer
                  .toTriples([update])
                  .pipe(map((uTransfored) => ({ updated: uTransfored[0] }))),
              // ),
            // ),
          ),
        )),
        tap((data) =>
          this.logger.debug(
            DGTSparqlQueryService.name,
            'Transformed updated',
            data,
          ),
        ),
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
        tap((data) =>
          this.logger.debug(
            DGTSparqlQueryService.name,
            'Prepared to update entities',
            data,
          ),
        ),
        switchMap(updates => this.exchanges.get(_.head(resources).exchange)
          .pipe(map(exchange => ({ updates, exchange })))),
        switchMap(data => this.connections.get(data.exchange.connection)
          .pipe(map((connection: DGTConnectionSolid) => ({ ...data, connection })))),
        switchMap(data => this.sources.get(data.exchange.source)
          .pipe(map(source => ({ ...data, source })))),
        switchMap((data) =>
          forkJoin(
            data.updates.map((update) =>
              this.generateToken(
                update.delta.updated.uri,
                data.connection,
                data.source,
              ).pipe(
                map(token => ({
                  headers: token ? { 'Content-Type': 'application/sparql-update', Authorization: 'Bearer ' + token } : { 'Content-Type': 'application/sparql-update' },
                })),
                switchMap(d => this.toSparqlInsert.serialize([update.delta.updated], transformer)
                  .pipe(map(serialized => ({ ...d, serialized })))),
                switchMap(d => {
                  // if (update.delta.original.triples.length === 0) {
                    return this.http.patch(
                      update.delta.updated.uri,
                      d.serialized,
                      d.headers,
                    );
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
          ).pipe(
            map((response) => resources.map((update) => update)),
          ),
        ),
      );
  }

  public prepare(source: DGTSourceSolid): Observable<DGTSourceSolid> {

    if (!source) {
      throw new DGTErrorArgument('Argument source should be set.', source);
    }

    this.logger.debug(DGTConnectorSolid.name, 'Starting to prepare source for connection', { source });

    return of({ source })
      .pipe(
        switchMap(data => this.discover(data.source)
          .pipe(map(configuration => ({ ...data, source: { ...data.source, configuration: { ...data.source.configuration, ...configuration } } })))),
        switchMap(data => this.jwks(data.source)
          .pipe(map(configuration => ({ ...data, source: { ...data.source, configuration: { ...data.source.configuration, ...configuration } } })))),
        switchMap(data => this.register(data.source)
          .pipe(map(configuration => ({ ...data, source: { ...data.source, state: DGTSourceState.PREPARED, configuration: { ...data.source.configuration, ...configuration } } })))),
        tap(src => this.logger.debug(DGTConnectorSolid.name, 'Prepared source for connection', { src })),
        map(data => data.source),
      );
  }

  public connect(purpose: DGTPurpose, exchange: DGTExchange, connection: DGTConnection<DGTConnectionSolidConfiguration>, source: DGTSource<DGTSourceSolidConfiguration>): Observable<DGTConnectionSolid> {

    if (!source) {
      throw new DGTErrorArgument('Argument source should be set.', source);
    }

    this.logger.debug(DGTConnectorSolid.name, 'Starting to connect to Solid', { connection, source: source.configuration });

    return of({ connection, source }).pipe(
      switchMap((data) =>
        this.generateUri(data.source, data.connection).pipe(
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

  /**
   * Registers an account on a solid server
   * @param source source to create account on
   * @param loginData data to use to create the account
   * @returns the http response
   */
  registerAccount(
    source: DGTSourceSolid,
    loginData: DGTSourceSolidLogin,
  ): Observable<any> {
    this.logger.debug(DGTConnectorSolid.name, 'Registering account', {
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
          DGTConnectorSolid.name,
          'Received registration response',
          { response, source },
        ),
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
  public isAvailableUsername(
    source: DGTSourceSolid,
    username: string,
  ): Observable<boolean> {
    this.logger.debug(
      DGTConnectorSolid.name,
      'Checking if username exists on solid server',
      { source, username },
    );

    const sourceuri = source.configuration.issuer;
    const url = 'https://' + username + '.' + sourceuri.split('//')[1];

    return this.http.head<DGTSourceSolidConfiguration>(url).pipe(
      tap((response) =>
        this.logger.debug(DGTConnectorSolid.name, 'Received response', {
          response,
        }),
      ),
      map((response) => response.status === 404),
    );
  }

  private discover(
    source: DGTSourceSolid,
  ): Observable<DGTSourceSolidConfiguration> {
    this.logger.debug(DGTConnectorSolid.name, 'Discovering source', {
      source,
    });

    const url = `${source.configuration.issuer}/.well-known/openid-configuration`;

    return this.http.get<DGTSourceSolidConfiguration>(url).pipe(
      tap((response) =>
        this.logger.debug(
          DGTConnectorSolid.name,
          'Received discover response',
          { response },
        ),
      ),
      map((response) => ({ ...source.configuration, ...response.data })),
    );
  }

  private jwks(
    source: DGTSourceSolid,
  ): Observable<DGTSourceSolidConfiguration> {
    this.logger.debug(DGTConnectorSolid.name, 'Retrieve JWK set', {
      source,
    });

    const url = `${source.configuration.jwks_uri}`;

    return this.http.get<any>(url).pipe(
      tap((response) =>
        this.logger.debug(
          DGTConnectorSolid.name,
          'Received jwks response',
          { response },
        ),
      ),
      map((response) => ({ ...source.configuration, keys: response.data.keys })),
    );
  }

  private register(source: DGTSourceSolid): Observable<DGTSourceSolidConfiguration> {
    this.logger.debug(DGTConnectorSolid.name, 'Registering client', {
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
        this.logger.debug(
          DGTConnectorSolid.name,
          'Received registration response',
          { response, source },
        ),
      ),
      map((response) => ({ ...source.configuration, ...response.data })),
    );
  }

  public generateUri(
    source: DGTSource<DGTSourceSolidConfiguration>,
    connection: DGTConnection<DGTConnectionSolidConfiguration>,
  ): Observable<string> {
    this.logger.debug(
      DGTConnectorSolid.name,
      'Starting to generate login uri',
      { source: source.configuration, connection },
    );
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
    )
      .pipe(
        map(digests => ({ digests })),
        tap(data => this.logger.debug(DGTConnectorSolid.name, 'Generated digests', { data, params, source, connection })),
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
        tap(data => this.logger.debug(DGTConnectorSolid.name, 'Generated nonce, state and key', { data, params, source, connection })),
        switchMap(data => this.crypto.generateKeyPair()
          .pipe(map(sessionKeys => ({ ...data, sessionKeys })))),
        tap(data => this.logger.debug(DGTConnectorSolid.name, 'Generated session keys', { data, params, source, connection })),
        map(data => {
          connection.configuration.privateKey = JSON.stringify(data.sessionKeys.privateKey);
          params.key = data.sessionKeys.publicKey;
        }),
        switchMap(() => {
          if (source.configuration.request_parameter_supported) {
            const excludeParams = ['scope', 'client_id', 'response_type', 'state'];
            const keysToEncode = Object.keys(params).filter(key => !excludeParams.includes(key));
            const payload = {};

            keysToEncode.forEach(key => {
              payload[key] = params[key];
            });

            const requestParamJwt = new JWT({
              header: { alg: 'none' },
              payload,
            }, { filter: false });

            return from(requestParamJwt.encode()
              .then(requestParamCompact => {
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

    if (
      connection &&
      connection.configuration &&
      connection.configuration.idToken
    ) {
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
    this.logger.debug(DGTConnectorSolid.name, 'Checking access rights', { exchange });

    return of(exchange).pipe(
      switchMap(data => this.purposes.get(exchange.purpose).pipe(
        map(purpose => ({ ...data, purpose })),
      )),
      switchMap(data => this.query<DGTSourceSolidTrustedApp>(exchange, this.transformer).pipe(
        map(trustedApps => ({ ...data, trustedApps })),
      )),
      tap(data => this.logger.debug(DGTConnectorSolid.name, 'Retrieved trusted apps', data.trustedApps)),
      map(data => ({ ...data, ourTrustedApp: data.trustedApps.find(app => this.origin.get().includes(app.origin)) })),
      tap(data => this.logger.debug(DGTConnectorSolid.name, 'Found our trusted app', data.ourTrustedApp)),
      map(data => {
        let res = false;
        const aclsNeeded: string[] = data.purpose.aclNeeded ? data.purpose.aclNeeded : [DGTSourceSolidTrustedAppMode.READ];

        if (data.ourTrustedApp && aclsNeeded.every(acl => data.ourTrustedApp.modes.includes(acl as DGTSourceSolidTrustedAppMode))) {
          res = true;
        }

        this.logger.debug(DGTConnectorSolid.name, 'Checked if acl modes are included', { res, aclsNeeded, ourTrustedApp: data.ourTrustedApp })

        return res;
      }),
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
        DGTConnectorSolid.name,
        'URL was undefined or null',
        url,
      );
      return of(false);
    }
    // Test if url is valid
    // Copyright (c) 2010-2018 Diego Perini (http://www.iport.it)
    const reg = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    if (!reg.test(url)) {
      this.logger.debug(DGTConnectorSolid.name, 'URL was not valid', url);
      return of(false);
    } else {
      // Check headers for Link
      return (
        this.http.head(url).pipe(
          map((res) => {
            const headers = res.headers;
            if (res.status !== 200) {
              this.logger.debug(
                DGTConnectorSolid.name,
                'Status was not 200',
                res.status,
              );
              return false;
            } else if (!headers.has('link')) {
              this.logger.debug(
                DGTConnectorSolid.name,
                'Headers did not contain Link',
                headers,
              );
              return false;
            } else if (
              headers.get('link') !==
              '<.acl>; rel="acl", <.meta>; rel="describedBy", <http://www.w3.org/ns/ldp#Resource>; rel="type"'
            ) {
              this.logger.debug(
                DGTConnectorSolid.name,
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
              this.logger.debug(
                DGTConnectorSolid.name,
                'Status was not 200',
                getRes.status,
              );
              return false;
            } else {
              this.logger.debug(
                DGTConnectorSolid.name,
                'URL has a solid server',
                url,
              );
              // When the url passes all of the previous checks, it is granted 'solid-server' status
              return true;
            }
          }),
        )
      );
    }
  }

  public generateToken(
    uri,
    connection: DGTConnectionSolid,
    source: DGTSourceSolid,
  ): Observable<string> {
    // for testing purposes
    // if (source.state === DGTSourceState.NOTPREPARED) {
    //   throw new DGTErrorArgument('The source should be prepared before trying to generate a token', source);
    // }

    return source.state === DGTSourceState.PREPARED ? DGTSourceSolidToken.issueFor(
      uri,
      connection.configuration.privateKey,
      source.configuration.client_id,
      connection.configuration.idToken,
    ) : of(null);
  }

  public loadTypeRegistrations(connection: DGTConnectionSolid, source: DGTSourceSolid, exchange: DGTExchange): Observable<DGTLDTypeRegistration[]> {
    this.logger.debug(DGTConnectorSolid.name, 'Starting to retrieve all type registration for profile.', { connection });

    if (!connection) {
      throw new DGTErrorArgument('Argument connection should be set.', connection);
    }

    return of({ connection, source, exchange })
      .pipe(
        switchMap(data => forkJoin(data.connection.configuration.typeIndexes.map(typeIndex => this.queryOne<DGTLDTypeRegistration>(typeIndex, data.exchange, data.connection, data.source, this.typeRegistrationsTransformer)))
        .pipe(map(typeRegistrations => ({...data, typeRegistrations: _.flatten(typeRegistrations)})))),
        switchMap(data => this.typeRegistrationsTransformer.toDomain(data.typeRegistrations)),
        tap(data => this.logger.debug(DGTConnectorSolid.name, 'Retrieved public type registration for profile.', data)),
      );
  }
}
