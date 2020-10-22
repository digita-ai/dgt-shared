import { DGTSourceSolidToken } from '@digita-ai/dgt-shared-connectors';
import { DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Generator, Update, Triple, Term } from 'sparqljs';
import { DGTConnectionSolidConfiguration } from '../../connection/models/dgt-connection-solid-configuration.model';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTLDTripleFactoryService } from '../../linked-data/services/dgt-ld-triple-factory.service';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';
import { DGTSourceSolidConfiguration } from '../../source/models/dgt-source-solid-configuration.model';
import { DGTSourceSolid } from '../../source/models/dgt-source-solid.model';
import { DGTSource } from '../../source/models/dgt-source.model';

/** Transforms linked data to trustedapps, and the other way around. */
@DGTInjectable()
export class DGTSparqlQueryService {

    constructor(
        public logger: DGTLoggerService,
        public http: DGTHttpService,
        private triples: DGTLDTripleFactoryService,
    ) { }
    
        // Method for formatting triples as a sparql update query 
        // -> string version of sparql query possible to insert in body of call to sparql chache service


    public generateSparqlUpdate(
        updatedEntities: DGTLDResource[],
        updateType: 'insert' | 'delete' | 'insertdelete',
        originalEntities?: DGTLDResource[]
    ): string {
        if (!updatedEntities) {
            throw new DGTErrorArgument(
                'updatedEntities should be set.',
                updatedEntities
            );
        }
        if (!updateType) {
            throw new DGTErrorArgument('updateType should be set.', updateType);
        }
        if (updateType === 'insertdelete' && !originalEntities) {
            throw new DGTErrorArgument(
                'originalEntities should be set.',
                originalEntities
            );
        }

        this.logger.debug(
            DGTSparqlQueryService.name,
            'Starting to generate SparQL for update',
            { updatedEntities }
        );

        const updatedTriples: DGTLDTriple[] = _.flatten(
            updatedEntities.map((entity) => entity.triples)
        );

        this.logger.debug(
            DGTSparqlQueryService.name,
            'Transformed updatedEntities to triples',
            { updatedTriples, updatedEntities }
        );

        const insertTriples: Triple[] = this.convertToTriples(updatedTriples);

        let deleteTriples: Triple[];
        if (updateType === 'insertdelete') {
            const originalTriples: DGTLDTriple[] = _.flatten(
                originalEntities.map((entity) => entity.triples)
            );
            this.logger.debug(
                DGTSparqlQueryService.name,
                'Transformed originalEntities to triples',
                { originalTriples, originalEntities }
            );
            deleteTriples = this.convertToTriples(originalTriples);
        }

        this.logger.debug(DGTSparqlQueryService.name, 'Parsed triples.', {
            insertTriples,
            deleteTriples,
        });

        let query: Update = null;

        if (updateType === 'delete') {
            query = {
                type: 'update',
                prefixes: {},
                updates: [
                    {
                        updateType,
                        delete: [{ type: 'bgp', triples: insertTriples }],
                    },
                ],
            };
        } else if (updateType === 'insert') {
            query = {
                type: 'update',
                prefixes: {},
                updates: [
                    {
                        updateType,
                        insert: [{ type: 'bgp', triples: insertTriples }],
                    },
                ],
            };
        } else if (updateType === 'insertdelete') {
            query = {
                type: 'update',
                prefixes: {},
                updates: [
                    {
                        updateType,
                        insert: [{ type: 'bgp', triples: insertTriples }],
                        delete: [{ type: 'bgp', triples: deleteTriples }],
                        where: [{ type: 'bgp', triples: deleteTriples }],
                    },
                ],
            };
        }

        this.logger.debug(DGTSparqlQueryService.name, 'Created query object.', {
            query,
            updatedEntities,
            insertTriples,
            deleteTriples,
        });

        const generator = new Generator();
        const body = generator.stringify(query);

        this.logger.debug(DGTSparqlQueryService.name, 'Created query string.', {
            body,
            query,
        });

        return body;
    }

    public convertToTriples(triples: DGTLDTriple[]): Triple[] {
        return triples.map((triple: DGTLDTriple) => {
            let object: Term = `${triple.object.value}` as Term;

            if (triple.object.termType === DGTLDTermType.LITERAL) {
                object = `\"${triple.object.value}\"^^${triple.object.dataType}` as Term;
            }

            return {
                subject: triple.subject.value as Term,
                predicate: triple.predicate as Term,
                object,
            };
        });
    }

    public add<T extends DGTLDResource>(domainEntities: T[], connection: DGTConnectionSolid, source: DGTSourceSolid, transformer: DGTLDTransformer<T>): Observable<T[]> {
        if (!domainEntities) {
            throw new DGTErrorArgument(
                'domainEntities should be set.',
                domainEntities
            );
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

        this.logger.debug(DGTSparqlQueryService.name, 'Starting to add entity', { domainEntities, connection });

        return transformer.toTriples(domainEntities, connection)
            .pipe(
                map(entities => ({
                    entities,
                    //TODO check if subject.value below is correct or should be renamed to holder
                    groupedEntities: _.groupBy(entities, 'subject.value'),
                    domainEntities,
                })),
                tap(data => this.logger.debug(DGTSparqlQueryService.name, 'Prepared to add entities', data)),
                switchMap(data => forkJoin(
                    Object.keys(data.groupedEntities).map(uri => {
                        return this.generateToken(uri, connection, source)
                            .pipe(
                                switchMap(token => this.http.patch(
                                    uri,
                                    this.generateSparqlUpdate(
                                        data.groupedEntities[uri],
                                        'insert'
                                    ),
                                    {
                                        'Content-Type': 'application/sparql-update',
                                        Authorization: 'Bearer ' + token,
                                    }
                                )
                                )
                            );
                    })
                ).pipe(map((response) => data.entities as T[]))
                )
            );
    }
    public delete<T extends DGTLDResource>(domainEntities: T[], connection: DGTConnectionSolid, source: DGTSourceSolid, transformer: DGTLDTransformer<T>): Observable<T[]> {
        if (!domainEntities) {
          throw new DGTErrorArgument(
            'domainEntities should be set.',
            domainEntities
          );
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
    
        this.logger.debug(
          DGTSparqlQueryService.name,
          'Starting to delete entity',
          { domainEntities, connection }
        );
    
        return transformer.toTriples(domainEntities, connection).pipe(
          map((entities) => ({
            entities,
            groupedEntities: _.groupBy(entities, 'documentUri'),
            domainEntities,
          })),
          tap((data) =>
            this.logger.debug(
              DGTSparqlQueryService.name,
              'Prepared entities',
              data
            )
          ),
          switchMap((data) =>
            forkJoin(
              Object.keys(data.groupedEntities).map((uri) => {
                return this.generateToken(uri, connection, source).pipe(
                  switchMap((token) =>
                    this.http.patch(
                      uri,
                      this.generateSparqlUpdate(
                        data.groupedEntities[uri],
                        'delete'
                      ),
                      {
                        'Content-Type': 'application/sparql-update',
                        Authorization: 'Bearer ' + token,
                      }
                    )
                  )
                );
              })
            ).pipe(map((response) => data.entities as T[]))
          )
        );
      }
    
      public update<T extends DGTLDResource>(domainEntities: { original: T, updated: T }[], connection: DGTConnectionSolid, source: DGTSourceSolid, transformer: DGTLDTransformer<T>): Observable<T[]> {
        if (!domainEntities) {
          throw new DGTErrorArgument(
            'domainEntities should be set.',
            domainEntities
          );
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
    
        this.logger.debug(
          DGTSparqlQueryService.name,
          'Starting to update entity',
          { domainEntities, connection, source, transformer }
        );
        return forkJoin(
          domainEntities.map((update) =>
            transformer.toTriples([update.original], connection).pipe(
              map((uTransfored) => ({ ...update, original: uTransfored[0] })),
              switchMap((u) =>
                transformer
                  .toTriples([u.updated], connection)
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
          switchMap((updates) =>
            forkJoin(
              updates.map((update) =>
                this.generateToken(
                  update.delta.updated.documentUri,
                  connection,
                  source
                ).pipe(
                  switchMap((token) => {
                    if (update.delta.original.triples.length === 0) {
                      return this.http.patch(
                        update.delta.updated.documentUri,
                        this.generateSparqlUpdate([update.delta.updated], 'insert'),
                        {
                          'Content-Type': 'application/sparql-update',
                          Authorization: 'Bearer ' + token,
                        }
                      );
                    }
    
                    if (update.delta.updated.triples.length === 0) {
                      throw new DGTErrorArgument(
                        'Updated values are undefined',
                        update.delta.updated
                      );
                    }
    
                    return this.http.patch(
                      update.delta.updated.documentUri,
                      this.generateSparqlUpdate(
                        [update.delta.updated],
                        'insertdelete',
                        [update.delta.original]
                      ),
                      {
                        'Content-Type': 'application/sparql-update',
                        Authorization: 'Bearer ' + token,
                      }
                    );
                  })
                )
              )
            ).pipe(
              map((response) => domainEntities.map((update) => update.updated))
            )
          )
        );
      }

      public query<T extends DGTLDResource>(documentUri: string, purpose: DGTPurpose, exchange: DGTExchange, connection: DGTConnection<DGTConnectionSolidConfiguration>, source: DGTSource<DGTSourceSolidConfiguration>, transformer: DGTLDTransformer<T> = null): Observable<T[]> {

        if (connection == null || connection.id == null || connection.configuration == null || connection.configuration.webId == null) {
          throw new DGTErrorArgument('connection, connection.id, connection.configuration and connection.configuration.webId should be set', { connection: connection });
        }
    
        if (!source || !source.id) {
          throw new DGTErrorArgument('source and source.id should be set', { source });
        }
    
        const uri = documentUri ? documentUri : connection.configuration.webId;
    
        this.logger.debug(DGTSparqlQueryService.name, 'Starting to query linked data service', { uri });
    
        return this.generateToken(uri, connection, source)
          .pipe(
            switchMap(token => this.http.get<string>(uri, {
              Authorization: 'Bearer ' + token,
              Accept: 'text/turtle'
            }, true)),
            tap(data => this.logger.debug(DGTSparqlQueryService.name, 'Received response from connection', { data })),
            map(data => data.data ? this.triples.createFromString(data.data, uri, exchange, source, connection) : []),
            tap(data => this.logger.debug(DGTSparqlQueryService.name, 'Parsed values', { data })),
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
      
      public generateToken(
        uri,
        connection: DGTConnectionSolid,
        source: DGTSourceSolid
      ): Observable<string> {
        return DGTSourceSolidToken.issueFor(
          uri,
          connection.configuration.privateKey,
          source.configuration.client_id,
          connection.configuration.idToken
        );
      }
}
