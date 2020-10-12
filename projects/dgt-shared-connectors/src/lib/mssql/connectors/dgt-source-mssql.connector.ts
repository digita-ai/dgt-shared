import { Observable, of, from } from 'rxjs';
import { ConnectionPool, IResult } from 'mssql';
import { DGTExchange, DGTPurpose, DGTSourceConnector, DGTLDTriple, DGTSource, DGTConnection, DGTLDTermType, DGTLDResource, DGTLDTransformer } from '@digita-ai/dgt-shared-data';
import { switchMap, map, tap } from 'rxjs/operators';
import { DGTMap, DGTLoggerService, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTSourceMSSQLConfiguration } from '../models/dgt-source-mssql-configuration.model';
import { DGTConnectionMSSQLConfiguration } from '../models/dgt-connection-mssql-configuration.model';


@DGTInjectable()
export class DGTSourceMSSQLConnector extends DGTSourceConnector<DGTSourceMSSQLConfiguration, DGTConnectionMSSQLConfiguration> {

    private pool: ConnectionPool = null;

    constructor(private logger: DGTLoggerService) {
        super();
    }

    public connect(purpose: DGTPurpose, exchange: DGTExchange, connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>): Observable<DGTConnection<DGTConnectionMSSQLConfiguration>> {
        return of(null);
    }

    public query<T extends DGTLDResource>(
        holderUri: string,
        purpose: DGTPurpose,
        exchange: DGTExchange,
        connection: DGTConnection<DGTConnectionMSSQLConfiguration>,
        source: DGTSource<DGTSourceMSSQLConfiguration>,
        transformer: DGTLDTransformer<T> = null,
    ): Observable<T[]> {
        return this.getPool(source).pipe(
                tap(pool => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', { pool })),
                switchMap(pool => from(pool.request().query(
                    source.configuration.commands.select(connection.configuration.personId)
                ),
                ).pipe(map(result => ({ result, pool })))),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished query', { data })),
                map(data => this.convertResult(holderUri, data.result, exchange, source.configuration.mapping, connection)),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Converted results', { data })),
                switchMap((entity: DGTLDResource) => transformer ? transformer.toDomain([entity]) : (of([entity] as T[]))),
            );
    }

    private convertResult(uri: string, sqlResult: IResult<any>, exchange: DGTExchange, mapping: DGTMap<string, string>, connection: DGTConnection<DGTConnectionMSSQLConfiguration>): DGTLDResource {
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Converting results', { sqlResult, exchange });
        const triples: DGTLDTriple[] = [];

        if (exchange && mapping && sqlResult && sqlResult.recordset) {
            sqlResult.recordset.forEach((record) => {
                if (record) {
                    mapping.forEach((field, key) => {
                        const value = record[key];

                        if (value) {
                            triples.push({
                                connection: connection.id,
                                exchange: exchange.id,
                                subject: {
                                    value: exchange.holder,
                                    termType: DGTLDTermType.REFERENCE
                                },
                                source: exchange.source,
                                predicate: field,
                                object: {
                                    value,
                                    termType: DGTLDTermType.LITERAL
                                },
                                originalValue: value,
                            });
                        }
                    });
                }
            });
        }

        return {
            triples,
            connection: connection.id,
            source: connection.source,
            documentUri: uri,
            subject: {
                value: uri,
                termType: DGTLDTermType.REFERENCE
            },
        };
    }

    public update<R extends DGTLDResource>(
        domainEntities: { original: R, updated: R }[],
        connection: DGTConnection<DGTConnectionMSSQLConfiguration>,
        source: DGTSource<DGTSourceMSSQLConfiguration>,
        transformer: DGTLDTransformer<R>,
    ): Observable<R[]> {
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting UPDATE, creating connection pool', {domainEntities, connection, source, transformer});

        return this.getPool(source).pipe(
                tap( pool => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', { pool })),
                map( pool => ({ pool, columns: `fn='${domainEntities[0].updated.subject.value}', points=6969`})),
                tap( data => this.logger.debug(DGTSourceMSSQLConnector.name, 'columns added to data', data )),
                switchMap(data => {
                    const query = source.configuration.commands.update(
                        connection.configuration.personId,
                        data.columns
                    );
                    return from(data.pool.request().query(query))
                    .pipe(map(result => ({ result, ...data })));
                }),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished UPDATE', { data })),
                map( () => domainEntities.map(entity => entity.updated)),
            );
    }

    public delete<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>, transformer: DGTLDTransformer<R>): Observable<R[]> {
/*         const config = this.extractConfig(source);
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting DELETE, creating connection pool', {
            source
        });

        const pool = this.getConnectionFromPool(config);
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Created connection pool', { pool });

        return of({ pool, config })
            .pipe(
                switchMap(data => from(data.pool.connect())
                    .pipe(map(newPool => ({ newPool, ...data })))
                ),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', { data })),
                switchMap(data => from(data.pool.request().query(source.configuration.commands.delete(connection.configuration.personId)))
                    .pipe(map(result => ({ result, ...data })))),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished DELETE', { data })),
                map(data => domainEntities),
            ); */
            return null;
    }

    public add<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>, transformer: DGTLDTransformer<R>): Observable<R[]> {
 /*        const config = this.extractConfig(source);
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting INSERT, creating connection pool', {source});

        const pool = this.getConnectionFromPool(config);
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Created connection pool', {pool});

        return of({ pool, config })
            .pipe(
                switchMap(data => from(data.pool.connect())
                    .pipe(map(newPool => ({ newPool, ...data })))
                ),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', { data })),
                switchMap(data => from(data.pool.request().query(
                    source.configuration.commands.insert(
                        connection.configuration.personId,
                        domainEntities[0].subject.value, // temp, webid as name to have a variable
                        '123'
                    )
                ))
                .pipe(map(result => ({ result, ...data })))),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished query', { data })),
                //map(data => this.convertResult(holderUri, data.result, exchange, source.configuration.mapping, connection)),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Converted results', { data })),
                //switchMap((entity: DGTLDResource) => transformer ? transformer.toDomain([entity]) : (of([entity] as T[])))
                map(data => domainEntities),
            ); */
            return null;
    }

    public upstreamSync<R extends DGTLDResource>(
        domainEntity: R,
        connection: DGTConnection<DGTConnectionMSSQLConfiguration>,
        source: DGTSource<DGTSourceMSSQLConfiguration>,
        transformer: DGTLDTransformer<R>,
        purpose: DGTPurpose,
        exchange: DGTExchange,
    ): Observable<R> {
        this.logger.debug(DGTSourceMSSQLConnector.name, 'upstream syncing',
        {domainEntity, connection, source, transformer, purpose, exchange});


        // find possible existing values
        return this.query(domainEntity.documentUri, purpose, exchange, connection, source, transformer).pipe(
            switchMap(existingValues => {
                if (existingValues[0]) {
                    // convert to list of {original: Object, updated: Object}
                    const updateDomainEntity = {original: existingValues[0], updated: domainEntity};
                    this.logger.debug(DGTSourceMSSQLConnector.name, 'Updating value in DB', updateDomainEntity);
                    return this.update([updateDomainEntity], connection, source, transformer).pipe( map(triples => triples[0]));
                } else {
                    this.logger.debug(DGTSourceMSSQLConnector.name, 'adding value to DB', domainEntity);
                    return this.add([domainEntity], connection, source, transformer).pipe( map(triples => triples[0]));
                }
            }),
        );
    }

    private extractConfig(source: DGTSource<any>) {
        return {
            user: source.configuration.user,
            password: source.configuration.password,
            server: source.configuration.server, // You can use 'localhost\\instance' to connect to named instance
            database: source.configuration.database,

            options: {
                encrypt: false // Use this if you're on Windows Azure
            }
        };
    }

    private getPool(source: DGTSource<any>): Observable<ConnectionPool> {
        if (!this.pool) {
            const config = this.extractConfig(source);
            this.logger.debug(DGTSourceMSSQLConnector.name, 'Creating connection pool');
            this.pool = new ConnectionPool(config);
            this.pool.on('error', err => {
                this.logger.debug(DGTSourceMSSQLConnector.name, 'Caught error in connection pool', err);
            });
            this.logger.debug(DGTSourceMSSQLConnector.name, 'Connect to connection pool');
            return from(this.pool.connect()).pipe(
                map( () => this.pool),
            );
        }
        return of(this.pool);
    }
}
