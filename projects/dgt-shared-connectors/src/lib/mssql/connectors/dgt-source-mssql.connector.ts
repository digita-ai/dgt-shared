import { Observable, of, from } from 'rxjs';
import { ConnectionPool, IResult } from 'mssql';
import { DGTExchange, DGTPurpose, DGTConnector, DGTLDTriple, DGTSource, DGTConnection, DGTLDTermType, DGTLDResource, DGTLDTransformer, DGTLDDataType, DGTConnectionService, DGTSourceService, DGTExchangeService } from '@digita-ai/dgt-shared-data';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { DGTMap, DGTLoggerService, DGTInjectable, DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { DGTSourceMSSQLConfiguration } from '../models/dgt-source-mssql-configuration.model';
import { DGTConnectionMSSQLConfiguration } from '../models/dgt-connection-mssql-configuration.model';
import * as _ from 'lodash';

@DGTInjectable()
export class DGTSourceMSSQLConnector extends DGTConnector<DGTSourceMSSQLConfiguration, DGTConnectionMSSQLConfiguration> {

    /**
     * Map of DGTSource IDs -> ConnectionPools
     */
    private pools: DGTMap<string, ConnectionPool>;

    constructor(private logger: DGTLoggerService, private connections: DGTConnectionService, private sources: DGTSourceService, private exchanges: DGTExchangeService) {
        super();
    }

    public connect(purpose: DGTPurpose, exchange: DGTExchange, connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>): Observable<DGTConnection<DGTConnectionMSSQLConfiguration>> {
        return of(null);
    }

    public query<T extends DGTLDResource>(holderUri: string, exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
        return of({ holderUri, exchange, transformer })
            .pipe(
                switchMap(data => this.sources.get(data.exchange.source)
                    .pipe(map(source => ({ ...data, source })))),
                switchMap(data => this.connections.get(data.exchange.connection)
                    .pipe(map(connection => ({ ...data, connection })))),
                switchMap(data => from(this.getPool(data.source).connect())
                    .pipe(map(pool => ({ ...data, pool })))),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', data)),
                switchMap(data => from(data.pool.request().query(
                    data.source.configuration.commands.select(data.connection.configuration.personId)
                )).pipe(map(result => ({ ...data, result })))),
                tap(data => data.pool.close()),
                // tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished query')),
                map(data => this.convertResult(data.holderUri, data.result, data.exchange, data.source.configuration.mapping)),
                // tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Converted results', { data })),
                switchMap(resource => transformer ? transformer.toDomain([resource]) : of([resource])),
                catchError(error => {
                    this.logger.debug(DGTSourceMSSQLConnector.name, 'Error while querying MSSQL', error);
                    throw new DGTErrorArgument('Error while querying MSSQL', null);
                }),
            ) as Observable<T[]>;

        // return of({ holderUri, exchange, transformer })
        //     .pipe(
        //         switchMap(data => this.connections.get(exchange.connection)
        //             .pipe(map(connection => ({ ...data, connection })))),
        //         switchMap(data => this.sources.get(exchange.source)
        //             .pipe(map(source => ({ ...data, source })))),
        //         switchMap(data => this.getPool(data.source)
        //             .pipe(map(pool => ({ ...data, pool })))),
        //         tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', data)),
        //         switchMap(data => from(data.pool.request().query(
        //             data.source.configuration.commands.select(data.connection.configuration.personId)
        //         ))
        //             .pipe(map(result => ({ ...data, result })))),
        //         map(data => this.convertResult(data.holderUri, data.result, data.exchange, data.source.configuration.mapping)),
        //         switchMap((entity: DGTLDResource) => transformer.toDomain([entity])),
        //         catchError(() => {
        //             this.logger.debug(DGTSourceMSSQLConnector.name, 'Error while querying MSSQL');
        //             throw new DGTErrorArgument('Error while querying MSSQL', null);
        //         }),
        //     );
    }

    private convertResult(uri: string, sqlResult: IResult<any>, exchange: DGTExchange, mapping: DGTMap<string, string>): DGTLDResource {
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Converting results', { sqlResult, exchange });
        const triples: DGTLDTriple[] = [];

        if (exchange && mapping && sqlResult && sqlResult.recordset) {
            sqlResult.recordset.forEach((record) => {
                if (record) {
                    mapping.forEach((field, key) => {
                        const value = record[key];

                        if (value) {
                            triples.push({
                                subject: {
                                    value: exchange.holder,
                                    termType: DGTLDTermType.REFERENCE
                                },
                                predicate: field,
                                object: {
                                    value,
                                    termType: DGTLDTermType.LITERAL,
                                    dataType: DGTLDDataType.STRING
                                },
                            });
                        }
                    });
                }
            });
        }

        return {
            triples,
            uri,
            exchange: exchange.id,
        };
    }

    public update<R extends DGTLDResource>(
        resources: { original: R, updated: R }[],
        transformer: DGTLDTransformer<R>,
    ): Observable<R[]> {
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting UPDATE, creating connection', { resources, transformer });

        return of({ resources, transformer })
            .pipe(
                switchMap(data => this.exchanges.get(_.head(resources).original.exchange)
                    .pipe(map(exchange => ({ ...data, exchange })))),
                switchMap(data => this.sources.get(data.exchange.source)
                    .pipe(map(source => ({ ...data, source })))),
                switchMap(data => this.connections.get(data.exchange.connection)
                    .pipe(map(connection => ({ ...data, connection })))),
                switchMap(data => from(this.getPool(data.source).connect())
                    .pipe(map(pool => ({ ...data, pool })))),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool')),
                switchMap(data => {
                    // construct columns part of query
                    // e.g. name="Tom Haegemans", points=1760
                    let columns = '';
                    data.resources.forEach(entity => {
                        const columnName = data.source.configuration.mapping.getByValue(entity.updated.triples[0].predicate);
                        columns = columns.concat(`${columnName}='${entity.updated.triples[0].object.value}', `);
                    });
                    // remove last comma
                    columns = columns.replace(/,\s*$/, '');
                    const query = data.source.configuration.commands.update(
                        data.connection.configuration.personId, columns
                    );
                    this.logger.debug(DGTSourceMSSQLConnector.name, 'Executeing query', query);
                    return from(data.pool.request().query(query))
                        .pipe(map(result => ({ ...data, result })));
                }),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished UPDATE')),
                map(data => data.resources.map(entity => entity.updated)),
                catchError(() => {
                    this.logger.debug(DGTSourceMSSQLConnector.name, 'Error while updating MSSQL');
                    throw new DGTErrorArgument('Error while updating MSSQL', null);
                }),
            ) as Observable<R[]>;
        // this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting UPDATE, creating connection pool', { resources, transformer });

        // return of({ resources, transformer })
        //     .pipe(
        //         switchMap(data => this.exchanges.get(_.head(resources).original.exchange)
        //             .pipe(map(exchange => ({ ...data, exchange })))),
        //         switchMap(data => this.connections.get(data.exchange.connection)
        //             .pipe(map(connection => ({ ...data, connection })))),
        //         switchMap(data => this.sources.get(data.exchange.source)
        //             .pipe(map(source => ({ ...data, source })))),
        //         switchMap(data => this.getPool(data.source)
        //             .pipe(map(pool => ({ ...data, pool })))),
        //         tap(pool => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', { pool })),
        //         switchMap(data => {
        //             // construct columns part of query
        //             // e.g. name="Tom Haegemans", points=1760
        //             let columns = '';
        //             resources.forEach(entity => {
        //                 const columnName = data.source.configuration.mapping.getByValue(entity.updated.triples[0].predicate);
        //                 columns = columns.concat(`${columnName}='${entity.updated.triples[0].object.value}', `);
        //             });
        //             // remove last comma
        //             columns = columns.replace(/,\s*$/, '');
        //             const query = data.source.configuration.commands.update(
        //                 data.connection.configuration.personId, columns
        //             );
        //             this.logger.debug(DGTSourceMSSQLConnector.name, 'Executeing query', query);
        //             return from(data.pool.request().query(query))
        //                 .pipe(map(result => ({ result, pool: data.pool })));
        //         }),
        //         tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished UPDATE', { data })),
        //         map(() => resources.map(entity => entity.updated)),
        //         catchError(() => {
        //             this.logger.debug(DGTSourceMSSQLConnector.name, 'Error while updating MSSQL');
        //             throw new DGTErrorArgument('Error while updating MSSQL', null);
        //         }),
        //     );
    }

    public delete<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        // At this points just delete the connection.configuration.personId 's record
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting DELETE, creating connection', { resources, transformer });

        return of({ resources, transformer })
            .pipe(
                switchMap(data => this.exchanges.get(_.head(resources).exchange)
                    .pipe(map(exchange => ({ ...data, exchange })))),
                switchMap(data => this.sources.get(data.exchange.source)
                    .pipe(map(source => ({ ...data, source })))),
                switchMap(data => this.connections.get(data.exchange.connection)
                    .pipe(map(connection => ({ ...data, connection })))),
                switchMap(data => from(this.getPool(data.source).connect())
                    .pipe(map(pool => ({ ...data, pool })))),
                tap(pool => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool')),
                switchMap(data => {
                    const query = data.source.configuration.commands.delete(
                        data.connection.configuration.personId
                    );
                    this.logger.debug(DGTSourceMSSQLConnector.name, 'Executeing query', query);
                    return from(data.pool.request().query(query))
                        .pipe(map(result => ({ ...data, result })));
                }),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished DELETE', { data })),
                map(data => data.resources),
                catchError(() => {
                    this.logger.debug(DGTSourceMSSQLConnector.name, 'Error while deleteing MSSQL');
                    throw new DGTErrorArgument('Error while deleteing MSSQL', null);
                }),
            );

        // this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting DELETE, creating connection pool', { resources, transformer });

        // return of({ resources, transformer })
        //     .pipe(
        //         switchMap(data => this.exchanges.get(_.head(resources).exchange)
        //             .pipe(map(exchange => ({ ...data, exchange })))),
        //         switchMap(data => this.connections.get(data.exchange.connection)
        //             .pipe(map(connection => ({ ...data, connection })))),
        //         switchMap(data => this.sources.get(data.exchange.source)
        //             .pipe(map(source => ({ ...data, source })))),
        //         switchMap(data => this.getPool(data.source)
        //             .pipe(map(pool => ({ ...data, pool })))),
        //         tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', data)),
        //         switchMap(data => {
        //             const query = data.source.configuration.commands.delete(
        //                 data.connection.configuration.personId
        //             );
        //             this.logger.debug(DGTSourceMSSQLConnector.name, 'Executeing query', query);
        //             return from(data.pool.request().query(query))
        //                 .pipe(map(result => ({ result, pool: data.pool })));
        //         }),
        //         tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished DELETE', { data })),
        //         map(() => resources),
        //         catchError(() => {
        //             this.logger.debug(DGTSourceMSSQLConnector.name, 'Error while deleteing MSSQL');
        //             throw new DGTErrorArgument('Error while deleteing MSSQL', null);
        //         }),
        //     );
    }

    public add<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>,): Observable<R[]> {
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting ADD, creating connection', { resources, transformer });

        return of({ resources, transformer })
            .pipe(
                switchMap(data => this.exchanges.get(_.head(resources).exchange)
                    .pipe(map(exchange => ({ ...data, exchange })))),
                switchMap(data => this.sources.get(data.exchange.source)
                    .pipe(map(source => ({ ...data, source })))),
                switchMap(data => this.connections.get(data.exchange.connection)
                    .pipe(map(connection => ({ ...data, connection })))),
                switchMap(data => from(this.getPool(data.source).connect())
                    .pipe(map(pool => ({ ...data, pool })))),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool')),
                switchMap(data => {
                    let cols = '';
                    let values = '';
                    data.source.configuration.mapping.forEach((value: string, key: string) => {
                        cols += key + ', ';
                        // TEMP TEMP TEMP TEMP TEMP TEMP
                        const temp = resources.find(e => e.triples[0].predicate === value);
                        values += temp ? `'${temp.triples[0].object.value}',` : 'NULL, ';
                    });
                    const query = data.source.configuration.commands.insert(
                        data.connection.configuration.personId,
                        cols.slice(0, -2), values.slice(0, -2)
                    );
                    this.logger.debug(DGTSourceMSSQLConnector.name, 'Executeing query', query);
                    return from(data.pool.request().query(query))
                        .pipe(map(result => ({ ...data, result })));
                }),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished ADD', { data })),
                map(data => data.resources),
                catchError(() => {
                    this.logger.debug(DGTSourceMSSQLConnector.name, 'Error while adding MSSQL');
                    throw new DGTErrorArgument('Error while adding MSSQL', null);
                }),
            );

    }


    //     this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting ADD, creating connection pool', { resources, transformer });

    //     return of({ resources, transformer })
    //         .pipe(
    //             switchMap(data => this.exchanges.get(_.head(resources).exchange)
    //                 .pipe(map(exchange => ({ ...data, exchange })))),
    //             switchMap(data => this.connections.get(data.exchange.connection)
    //                 .pipe(map(connection => ({ ...data, connection })))),
    //             switchMap(data => this.sources.get(data.exchange.source)
    //                 .pipe(map(source => ({ ...data, source })))),
    //             switchMap(data => this.getPool(data.source)
    //                 .pipe(map(pool => ({ ...data, pool })))),
    //             tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', { data })),
    //             switchMap(data => {
    //                 let cols = '';
    //                 let values = '';
    //                 data.source.configuration.mapping.forEach((value: string, key: string) => {
    //                     cols += key + ', ';
    //                     // TEMP TEMP TEMP TEMP TEMP TEMP
    //                     const temp = resources.find(e => e.triples[0].predicate === value);
    //                     values += temp ? `'${temp.triples[0].object.value}',` : 'NULL, ';
    //                 });
    //                 const query = data.source.configuration.commands.insert(
    //                     data.connection.configuration.personId,
    //                     cols.slice(0, -2), values.slice(0, -2)
    //                 );
    //                 this.logger.debug(DGTSourceMSSQLConnector.name, 'Executeing query', query);
    //                 return from(data.pool.request().query(query))
    //                     .pipe(map(result => ({ result, pool: data.pool })));
    //             }),
    //             tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished ADD', { data })),
    //             map(() => resources),
    //             catchError(() => {
    //                 this.logger.debug(DGTSourceMSSQLConnector.name, 'Error while adding MSSQL');
    //                 throw new DGTErrorArgument('Error while adding MSSQL', null);
    //             }),
    //         );
    // }

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

    private getPool(source: DGTSource<any>): ConnectionPool {
        try {
            const config = this.extractConfig(source);
            this.logger.debug(DGTSourceMSSQLConnector.name, 'Creating connection pool', config);
            const pool = new ConnectionPool(config);
            pool.on('error', err => {
                this.logger.debug(DGTSourceMSSQLConnector.name, 'Caught error in connection pool', err);
            });
            return pool;
        } catch (err) {
            this.logger.debug(DGTSourceMSSQLConnector.name, 'Caught error in create connection', { err, source });
            throw new DGTErrorArgument(err, err);
        }
    }
}
