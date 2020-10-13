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
            switchMap(pool => {
                // construct columns part of query
                // e.g. name="Tom Haegemans", points=1760
                let columns = '';
                domainEntities.forEach(entity => {
                    const columnName = source.configuration.mapping.getByValue(entity.updated.triples[0].predicate);
                    columns = columns.concat(`${columnName}='${entity.updated.triples[0].object.value}', `);
                });
                // remove last comma
                columns = columns.replace(/,\s*$/, '');
                const query = source.configuration.commands.update(
                    connection.configuration.personId, columns
                );
                this.logger.debug(DGTSourceMSSQLConnector.name, 'Executeing query', query);
                return from(pool.request().query(query))
                .pipe(map(result => ({ result, pool })));
            }),
            tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished UPDATE', { data })),
            map( () => domainEntities.map(entity => entity.updated)),
        );
    }

    public delete<R extends DGTLDResource>(
        domainEntities: R[],
        connection: DGTConnection<DGTConnectionMSSQLConfiguration>,
        source: DGTSource<DGTSourceMSSQLConfiguration>,
        transformer: DGTLDTransformer<R>,
    ): Observable<R[]> {
        // At this points just delete the connection.configuration.personId 's record
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting DELETE, creating connection pool', {domainEntities, connection, source, transformer});

        return this.getPool(source).pipe(
            tap( pool => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', { pool })),
            switchMap(pool => {
                const query = source.configuration.commands.delete(
                    connection.configuration.personId
                );
                this.logger.debug(DGTSourceMSSQLConnector.name, 'Executeing query', query);
                return from(pool.request().query(query))
                .pipe(map(result => ({ result, pool })));
            }),
            tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished DELETE', { data })),
            map( () => domainEntities),
        );
    }

    public add<R extends DGTLDResource>(
        domainEntities: R[],
        connection: DGTConnection<DGTConnectionMSSQLConfiguration>,
        source: DGTSource<DGTSourceMSSQLConfiguration>,
        transformer: DGTLDTransformer<R>,
    ): Observable<R[]> {
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting ADD, creating connection pool', {domainEntities, connection, source, transformer});

        return this.getPool(source).pipe(
            tap( pool => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', { pool })),
            switchMap(pool => {
                let cols = '';
                let values = '';
                source.configuration.mapping.forEach( (value: string, key: string) => {
                    cols += key + ', ';
                    // TEMP TEMP TEMP TEMP TEMP TEMP
                    const temp = domainEntities.find( e => e.triples[0].predicate === value);
                    values += temp ? `'${temp.triples[0].object.value}',`  : 'NULL, ';
                });
                const query = source.configuration.commands.insert(
                    connection.configuration.personId,
                    cols.slice(0, -2), values.slice(0, -2)
                );
                this.logger.debug(DGTSourceMSSQLConnector.name, 'Executeing query', query);
                return from(pool.request().query(query))
                .pipe(map(result => ({ result, pool })));
            }),
            tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished ADD', { data })),
            map( () => domainEntities),
        );
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
