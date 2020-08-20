import { Observable, of, forkJoin, from } from 'rxjs';
import { DGTLDTripleFactoryService, DGTConnection, DGTSourceConnector, DGTExchange, DGTJustification, DGTSource, DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration, DGTSourceType, DGTSourceSolid, DGTConnectionState, DGTConnectionSolid, DGTLDNode, DGTLDTriple, DGTLDResource, DGTLDTermType, DGTLDTransformer, DGTSourceState } from '@digita/dgt-shared-data';
import { Injectable } from '@angular/core';
import { DGTLoggerService, DGTHttpService, DGTErrorArgument, DGTConfigurationService, DGTConfigurationBase } from '@digita/dgt-shared-utils';
import { switchMap, map, tap } from 'rxjs/operators';
import { JWT } from '@solid/jose';
import base64url from 'base64url';
import { Generator, Update, Triple, Term } from 'sparqljs';
import * as _ from 'lodash';
import { DGTSourceSolidLogin } from '../models/dgt-source-solid-login.model';
import { DGTCryptoService, DGTEnvironmentService } from '@digita/dgt-shared-utils';
import { DGTSourceSolidTrustedApp } from '../models/dgt-source-solid-trusted-app.model';
import { DGTSourceSolidTrustedAppTransformerService } from '../services/dgt-source-solid-trusted-app-transformer.service';
import { DGTSourceSolidTrustedAppMode } from '../models/dgt-source-solid-trusted-app-mode.model';
import { Quad } from 'n3';
import { v4 } from 'uuid';

@Injectable()
export class DGTSourceSolidConnector implements DGTSourceConnector<DGTSourceSolidConfiguration, DGTConnectionSolidConfiguration> {
  constructor(private logger: DGTLoggerService,
    private http: DGTHttpService,
    private config: DGTConfigurationService<DGTConfigurationBase>,
    private triples: DGTLDTripleFactoryService,
    private crypto: DGTCryptoService,
    private environment: DGTEnvironmentService,
    private transformer: DGTSourceSolidTrustedAppTransformerService
  ) { }

  public prepare(connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<DGTSourceSolid> {

    if (!source) {
      throw new DGTErrorArgument('Argument source should be set.', source);
    }

    this.logger.debug(DGTSourceSolidConnector.name, 'Starting to prepare source for connection', { connection, source });

    let res: Observable<DGTSourceSolid> = null;

    if (source && source.type === DGTSourceType.SOLID) {
      res = of({ connection, source })
        .pipe(
          switchMap(data => this.discover(data.source)
            .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
          switchMap(data => this.jwks(data.source)
            .pipe(map(configuration => ({ ...data, source: { ...source, configuration } })))),
          switchMap(data => this.register(data.source, data.connection)
            .pipe(map(configuration => ({ ...source, configuration })))),
          map(src => ({ ...src, state: DGTSourceState.PREPARED })),
        );
    }

    this.logger.debug(DGTSourceSolidConnector.name, 'Prepared source for connection', { connection, source });

    return res;
  }

  public connect(justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<DGTConnectionSolidConfiguration>, source: DGTSource<DGTSourceSolidConfiguration>): Observable<DGTConnectionSolid> {

    if (!source) {
      throw new DGTErrorArgument('Argument source should be set.', source);
    }

    this.logger.debug(DGTSourceSolidConnector.name, 'Starting to connect to Solid', { connection, source });

    let res: Observable<DGTConnection<any>> = null;

    if (source && source.type === DGTSourceType.SOLID) {
      res = of({ connection, source })
        .pipe(
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
          map(data => data.connection)
        );
    }

    return res;
  }

  public query<T extends DGTLDResource>(documentUri: string, justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<DGTConnectionSolidConfiguration>, source: DGTSource<DGTSourceSolidConfiguration>, transformer: DGTLDTransformer<T> = null): Observable<T[]> {

    if (!connection || !connection.id || !connection.configuration || !connection.configuration.webId) {
      throw new DGTErrorArgument('connection, connection.id, connection.configuration and connection.configuration.webId should be set', exchange.id);
    }

    if (!source || !source.id) {
      throw new DGTErrorArgument('source and source.id should be set', exchange);
    }

    const uri = documentUri ? documentUri : connection.configuration.webId;

    this.logger.debug(DGTSourceSolidConnector.name, 'Starting to query linked data service', { uri });

    return this.generateToken(uri, connection, source)
      .pipe(
        switchMap(token => this.http.get<string>(uri, {
          Authorization: 'Bearer ' + token
        }, true)),
        tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Received response from connection', { data })),
        map(data => this.triples.createFromString(data.data, uri, exchange, source, connection)),
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
        switchMap((entity: DGTLDResource) => transformer ? transformer.toDomain([entity]) : (of([entity] as T[])))
      );
  }

  public add<T extends DGTLDResource>(domainEntities: T[], connection: DGTConnectionSolid, source: DGTSourceSolid, transformer: DGTLDTransformer<T>): Observable<T[]> {
    if (!domainEntities) {
      throw new DGTErrorArgument('domainEntities should be set.', domainEntities);
    }

    if (!connection) {
      throw new DGTErrorArgument('connection should be set.', connection);
    }

    if (!source) {
      throw new DGTErrorArgument('source should be set.', source);
    }

    if (!transformer) {
      throw new DGTErrorArgument('transformer should be set.', transformer);
    }

    this.logger.debug(DGTSourceSolidConnector.name, 'Starting to add entity', { domainEntities, connection });

    return transformer.toTriples(domainEntities, connection)
      .pipe(
        map(entities => ({
          entities,
          groupedEntities: _.groupBy(entities, 'subject.value'),
          domainEntities,
        })),
        tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Prepared to add entities', data)),
        switchMap(data => forkJoin(
          Object.keys(data.groupedEntities).map(uri => {
            return this.generateToken(uri, connection, source)
              .pipe(
                switchMap(token => this.http.patch(
                  uri,
                  this.generateSparqlUpdate(data.groupedEntities[uri], 'insert'),
                  {
                    'Content-Type': 'application/sparql-update',
                    Authorization: 'Bearer ' + token
                  })
                )
              );
          }
          ))
          .pipe(
            map(response => data.entities as T[]),
          )
        ),
      );
  }

  public delete<T extends DGTLDResource>(domainEntities: T[], connection: DGTConnectionSolid, source: DGTSourceSolid, transformer: DGTLDTransformer<T>): Observable<T[]> {
    if (!domainEntities) {
      throw new DGTErrorArgument('domainEntities should be set.', domainEntities);
    }

    if (!connection) {
      throw new DGTErrorArgument('connection should be set.', connection);
    }

    if (!source) {
      throw new DGTErrorArgument('source should be set.', source);
    }

    if (!transformer) {
      throw new DGTErrorArgument('transformer should be set.', transformer);
    }

    this.logger.debug(DGTSourceSolidConnector.name, 'Starting to delete entity', { domainEntities, connection });

    return transformer.toTriples(domainEntities, connection)
      .pipe(
        map(entities => ({
          entities,
          groupedEntities: _.groupBy(entities, 'documentUri'),
          domainEntities,
        })),
        tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Prepared entities', data)),
        switchMap(data => forkJoin(
          Object.keys(data.groupedEntities).map(uri => {
            return this.generateToken(uri, connection, source)
              .pipe(
                switchMap(token => this.http.patch(
                  uri,
                  this.generateSparqlUpdate(data.groupedEntities[uri], 'delete'),
                  {
                    'Content-Type': 'application/sparql-update',
                    Authorization: 'Bearer ' + token
                  })
                )
              );
          }
          ))
          .pipe(
            map(response => data.entities as T[]),
          )
        ),
      );
  }

  public update<T extends DGTLDResource>(domainEntities: { original: T, updated: T }[], connection: DGTConnectionSolid, source: DGTSourceSolid, transformer: DGTLDTransformer<T>): Observable<T[]> {
    if (!domainEntities) {
      throw new DGTErrorArgument('domainEntities should be set.', domainEntities);
    }

    if (!connection) {
      throw new DGTErrorArgument('connection should be set.', connection);
    }

    if (!source) {
      throw new DGTErrorArgument('source should be set.', source);
    }

    if (!transformer) {
      throw new DGTErrorArgument('transformer should be set.', transformer);
    }

    this.logger.debug(DGTSourceSolidConnector.name, 'Starting to update entity', { domainEntities, connection, source, transformer });
    return forkJoin(
      domainEntities.map(update => transformer.toTriples([update.original], connection)
        .pipe(
          map(uTransfored => ({ ...update, original: uTransfored[0] })),
          switchMap(u => transformer.toTriples([u.updated], connection)
            .pipe(map(uTransfored => ({ ...u, updated: uTransfored[0] })))),
        )
      ))
      .pipe(
        tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Transformed updated', data)),
        map(updates => updates.map(update => ({
          ...update,
          delta: {
            updated: {
              ...update.updated,
              triples: _.differenceWith(update.updated.triples, update.original.triples, _.isEqual) as DGTLDTriple[]
            },
            original: {
              ...update.original,
              triples: _.differenceWith(update.original.triples, update.updated.triples, _.isEqual) as DGTLDTriple[]
            }
          },
        }))),
        tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Prepared to update entities', data)),
        switchMap(updates => forkJoin(
          updates.map(update =>
            this.generateToken(update.delta.updated.documentUri, connection, source)
              .pipe(
                switchMap(token => {

                  if (update.delta.original.triples.length === 0) {
                    return this.http.patch(
                      update.delta.updated.documentUri,
                      this.generateSparqlUpdate([update.delta.updated], 'insert'),
                      { 'Content-Type': 'application/sparql-update', Authorization: 'Bearer ' + token }
                    );
                  }

                  if (update.delta.updated.triples.length === 0) {
                    throw new DGTErrorArgument('Updated values are undefined', update.delta.updated);
                  }

                  return this.http.patch(
                    update.delta.updated.documentUri,
                    this.generateSparqlUpdate([update.delta.updated], 'insertdelete', [update.delta.original]),
                    { 'Content-Type': 'application/sparql-update', Authorization: 'Bearer ' + token }
                  );
                })
              )
          ))
          .pipe(
            map(response => domainEntities.map(update => update.updated)),
          )
        ),
      );
  }
  /**
   * Registers an account on a solid server
   * @param source source to create account on
   * @param loginData data to use to create the account
   * @returns the http response
   */
  registerAccount(source: DGTSourceSolid, loginData: DGTSourceSolidLogin): Observable<any> {
    this.logger.debug(DGTSourceSolidConnector.name, 'Registering account', { source });

    const uri = source.configuration.issuer + '/api/accounts/new';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*'
    };

    const body = `username=${loginData.username}&name=${loginData.name}&password=${loginData.password}&repeat_password=${loginData.password}&email=${loginData.email}`;

    return this.http.post<any>(uri, body, headers)
      .pipe(
        tap(response => this.logger.debug(DGTSourceSolidConnector.name, 'Received registration response', { response, source })),
        map(response => ({ response, ...source.configuration })),
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
    this.logger.debug(DGTSourceSolidConnector.name, 'Checking if username exists on solid server', { source, username });

    const sourceuri = source.configuration.issuer;
    const url = 'https://' + username + '.' + sourceuri.split('//')[1];

    return this.http.head<DGTSourceSolidConfiguration>(url).pipe(
      tap(response => this.logger.debug(DGTSourceSolidConnector.name, 'Received response', { response })),
      map(response => (response.status === 404))
    );
  }

  /**
   * Check if a solid server is running on the given url
   * @param url url to test
   * @returns true if the specified url is a solid server, false if not
   */
  public isSolidServer(url: string): Observable<boolean> {
    if (!url) {
      this.logger.debug(DGTSourceSolidConnector.name, 'URL was undefined or null', url);
      return of(false);
    }
    // Test if url is valid
    // Copyright (c) 2010-2018 Diego Perini (http://www.iport.it)
    const reg = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    if (!reg.test(url)) {
      this.logger.debug(DGTSourceSolidConnector.name, 'URL was not valid', url);
      return of(false);
    } else {
      // Check headers for Link
      return this.http.head(url).pipe(
        map(res => {
          const headers = res.headers;
          if (res.status !== 200) {
            this.logger.debug(DGTSourceSolidConnector.name, 'Status was not 200', res.status);
            return false;
          } else if (!headers.has('link')) {
            this.logger.debug(DGTSourceSolidConnector.name, 'Headers did not contain Link', headers);
            return false;
          } else if (headers.get('link') !== '<.acl>; rel="acl", <.meta>; rel="describedBy", <http://www.w3.org/ns/ldp#Resource>; rel="type"') {
            this.logger.debug(DGTSourceSolidConnector.name, 'Link header value did not match', headers.get('link'));
            return false;
          } else {
            return true;
          }
        })
      )
        &&
        // Check if /.well-known/openid-configuration exists on server
        this.http.get(url + '/.well-known/openid-configuration').pipe(
          map(getRes => {
            if (getRes.status !== 200) {
              this.logger.debug(DGTSourceSolidConnector.name, 'Status was not 200', getRes.status);
              return false;
            } else {
              this.logger.debug(DGTSourceSolidConnector.name, 'URL has a solid server', url);
              // When the url passes all of the previous checks, it is granted 'solid-server' status and awarded a small applause
              return true;
            }
          })
        );
    }
  }

  private generateSparqlUpdate(
    updatedEntities: DGTLDResource[],
    updateType: 'insert' | 'delete' | 'insertdelete',
    originalEntities?: DGTLDResource[]
  ): string {
    if (!updatedEntities) { throw new DGTErrorArgument('updatedEntities should be set.', updatedEntities); }
    if (!updateType) { throw new DGTErrorArgument('updateType should be set.', updateType); }
    if (updateType === 'insertdelete' && !originalEntities) {
      throw new DGTErrorArgument('originalEntities should be set.', originalEntities);
    }

    this.logger.debug(DGTSourceSolidConnector.name, 'Starting to generate SparQL for update', { updatedEntities });

    const updatedTriples: DGTLDTriple[] = _.flatten(updatedEntities.map(entity => entity.triples));

    this.logger.debug(DGTSourceSolidConnector.name, 'Transformed updatedEntities to triples', { updatedTriples, updatedEntities });

    const insertTriples: Triple[] = this.convertToTriples(updatedTriples);

    let deleteTriples: Triple[];
    if (updateType === 'insertdelete') {
      const originalTriples: DGTLDTriple[] = _.flatten(originalEntities.map(entity => entity.triples));
      this.logger.debug(DGTSourceSolidConnector.name, 'Transformed originalEntities to triples', { originalTriples, originalEntities });
      deleteTriples = this.convertToTriples(originalTriples);
    }

    this.logger.debug(DGTSourceSolidConnector.name, 'Parsed triples.', { insertTriples, deleteTriples });

    let query: Update = null;

    if (updateType === 'delete') {
      query = {
        type: 'update', prefixes: {},
        updates: [{
          updateType,
          delete: [{ type: 'bgp', triples: insertTriples }]
        }]
      };
    } else if (updateType === 'insert') {
      query = {
        type: 'update', prefixes: {},
        updates: [{
          updateType,
          insert: [{ type: 'bgp', triples: insertTriples }]
        }]
      };
    } else if (updateType === 'insertdelete') {
      query = {
        type: 'update', prefixes: {},
        updates: [{
          updateType,
          insert: [{ type: 'bgp', triples: insertTriples }],
          delete: [{ type: 'bgp', triples: deleteTriples }],
          where: [{ type: 'bgp', triples: deleteTriples }]
        }]
      };
    }

    this.logger.debug(DGTSourceSolidConnector.name, 'Created query object.', { query, updatedEntities, insertTriples, deleteTriples });

    const generator = new Generator();
    const body = generator.stringify(query);

    this.logger.debug(DGTSourceSolidConnector.name, 'Created query string.', { body, query });

    return body;
  }

  private convertToTriples(triples: DGTLDTriple[]): Triple[] {
    return triples.map((triple: DGTLDTriple) => {
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
      client_uri: this.environment.baseUri,
      logo_uri: `${this.environment.baseUri}assets/images/logo.png`,
      response_types: ['code', 'code id_token token'],
      grant_types: ['authorization_code'],
      default_max_age: 7200,
      post_logout_redirect_uris: [`${this.environment.baseUri}connect/logout`],
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
    params.state = this.crypto.generateRandomNumbers(16);
    params.nonce = this.crypto.generateRandomNumbers(16);

    return forkJoin(
      this.crypto.digest(new Uint8Array(params.state)),
      this.crypto.digest(new Uint8Array(params.nonce)),
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
        switchMap(data => this.crypto.generateKeyPair()
          .pipe(map(sessionKeys => ({ ...data, sessionKeys })))),
        tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Generated session keys', { data, params, source, connection })),
        map(data => {
          connection.configuration.privateKey = JSON.stringify(data.sessionKeys.privateKey);
          params.key = data.sessionKeys.publicKey;
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

  private encode(data): string {
    const pairs = [];

    Object.keys(data).forEach((key) => {
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    });

    return pairs.join('&');
  }

  /**
   * Checks if a specific connection has sufficient access rights.
   * @param connection The connection for which to check access rights.
   * @param justification The justification which indicates the amount of access rights required.
   * @param exchange The exchange for which to check access rights.
   * @param source The source on which the connection is hosted.
   */
  public checkAccessRights(connection: DGTConnectionSolid, justification: DGTJustification, exchange: DGTExchange, source: DGTSourceSolid): Observable<boolean> {
    this.logger.debug(DGTSourceSolidConnector.name, 'Checking access rights', { connection, justification });

    if (!connection) {
      throw new DGTErrorArgument('Argument connection should be set.', connection);
    }

    if (!justification) {
      throw new DGTErrorArgument('Argument justification should be set.', justification);
    }

    if (!source) {
      throw new DGTErrorArgument('Argument source should be set.', source);
    }

    return of({ connection, justification }).pipe(
      switchMap(data => this.query<DGTSourceSolidTrustedApp>(connection.configuration.webId, justification, exchange, connection, source, this.transformer).pipe(
        map(trustedApps => ({ ...data, trustedApps }))
      )),
      tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Retrieved trusted apps', data.trustedApps)),
      map(data => ({ ...data, ourTrustedApp: data.trustedApps.find(app => this.environment.baseUri.includes(app.origin)) })),
      tap(data => this.logger.debug(DGTSourceSolidConnector.name, 'Found our trusted app', data.ourTrustedApp)),
      map(data => {
        let res = false;
        const aclsNeeded: string[] = data.justification.aclNeeded ? data.justification.aclNeeded : [DGTSourceSolidTrustedAppMode.READ];


        if (data.ourTrustedApp && aclsNeeded.every(acl => data.ourTrustedApp.modes.includes(acl as DGTSourceSolidTrustedAppMode))) {
          res = true
        }

        this.logger.debug(DGTSourceSolidConnector.name, 'Checked if acl modes are included', { res, aclsNeeded, ourTrustedApp: data.ourTrustedApp })

        return res;
      })
    );
  }

  private generateToken(uri, connection: DGTConnectionSolid, source: DGTSourceSolid): Observable<string> {
    return of('');
    // return DGTSourceSolidToken.issueFor(
    //   uri,
    //   connection.configuration.privateKey,
    //   source.configuration.client_id,
    //   connection.configuration.idToken
    // );
  }
}
