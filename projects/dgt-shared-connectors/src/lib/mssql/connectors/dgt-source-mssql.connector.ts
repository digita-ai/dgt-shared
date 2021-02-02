import {
    DGTConnection,
    DGTConnectionMSSQLConfiguration,
    DGTConnectionService,
    DGTConnector,
    DGTExchange,
    DGTExchangeService,
    DGTLDDataType,
    DGTLDResource,
    DGTLDTermType,
    DGTLDTransformer,
    DGTLDTriple,
    DGTPurpose,
    DGTSource,
    DGTSourceMSSQLConfiguration,
    DGTSourceService,
    DGTUriFactoryService,
} from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTMap } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { ConnectionPool, IResult } from 'mssql';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@DGTInjectable()
export class DGTConnectorMSSQL extends DGTConnector<DGTSourceMSSQLConfiguration, DGTConnectionMSSQLConfiguration> {
    /**
     * Map of DGTSource uri -> ConnectionPools
     */
    private pools: DGTMap<string, ConnectionPool>;

    constructor(
        private logger: DGTLoggerService,
        private connections: DGTConnectionService,
        private sources: DGTSourceService,
        private exchanges: DGTExchangeService,
        private uris: DGTUriFactoryService,
    ) {
        super();
    }

    public connect(
        purpose: DGTPurpose,
        exchange: DGTExchange,
        connection: DGTConnection<DGTConnectionMSSQLConfiguration>,
        source: DGTSource<DGTSourceMSSQLConfiguration>,
    ): Observable<DGTConnection<DGTConnectionMSSQLConfiguration>> {
        return of(null);
    }

    public query<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
        return of({ exchange, transformer }).pipe(
            switchMap((data) =>
                this.connections.get(exchange.connection).pipe(map((connection) => ({ ...data, connection }))),
            ),
            switchMap((data) =>
                this.sources
                    .get(exchange.source)
                    .pipe(map((source: DGTSource<DGTSourceMSSQLConfiguration>) => ({ ...data, source }))),
            ),
            switchMap((data) =>
                this.getPool(data.source).pipe(
                    map((pool) => ({
                        ...data,
                        pool,
                        query: this.renderSelectQuery(data.source.configuration.commands.select, {
                            id: data.connection.configuration.personId,
                        }),
                    })),
                ),
            ),
            tap((data) => this.logger.debug(DGTConnectorMSSQL.name, 'Connected to pool', data)),
            switchMap((data) =>
                from(data.pool.request().query(data.query)).pipe(map((result) => ({ ...data, result }))),
            ),
            tap((data) => data.pool.close()),
            map((data) => this.convertResult(data.result, data.exchange, data.source.configuration.mapping)),
            switchMap((resource) => this.uris.generate([resource], 'data').pipe(map((resources) => _.head(resources)))),
            switchMap((entity: DGTLDResource) => transformer.toDomain([entity])),
            catchError((error) => {
                this.logger.error(DGTConnectorMSSQL.name, 'Error while querying MSSQL', error);
                throw new DGTErrorArgument('Error while querying MSSQL', null);
            }),
        ) as Observable<T[]>;
    }

    private convertResult(
        sqlResult: IResult<any>,
        exchange: DGTExchange,
        mapping: { [key: string]: string },
    ): DGTLDResource {
        this.logger.debug(DGTConnectorMSSQL.name, 'Converting results', { mapping, sqlResult, exchange });
        const triples: DGTLDTriple[] = [];

        if (exchange && mapping && sqlResult && sqlResult.recordset) {
            sqlResult.recordset.forEach((record) => {
                if (record) {
                    Object.keys(mapping).forEach((key) => {
                        this.logger.debug(DGTConnectorMSSQL.name, 'Converting for mapping', { mapping, key, record });
                        const value = record[key];

                        if (value) {
                            triples.push({
                                subject: {
                                    value: exchange.holder,
                                    termType: DGTLDTermType.REFERENCE,
                                },
                                predicate: mapping[key],
                                object: {
                                    value,
                                    termType: DGTLDTermType.LITERAL,
                                    dataType: DGTLDDataType.STRING,
                                },
                            });
                        }
                    });
                }
            });
        }

        return {
            triples,
            uri: null,
            exchange: exchange.uri,
        };
    }

    public save<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        return of({ resources, transformer }).pipe(
            switchMap((data) =>
                this.update(
                    resources.filter((r) => r.uri !== null),
                    data.transformer,
                ).pipe(map((updated) => ({ ...data, updated }))),
            ),
            switchMap((data) =>
                this.add(
                    resources.filter((r) => r.uri === null),
                    data.transformer,
                ).pipe(map((added) => ({ ...data, added }))),
            ),
            map((data) => [...data.added, ...data.updated]),
        );
    }

    private update<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        this.logger.info(DGTConnectorMSSQL.name, 'Starting UPDATE, creating connection pool', {
            resources,
            transformer,
        });

        return of({ resources, transformer }).pipe(
            switchMap((data) =>
                this.exchanges.get(_.head(resources).exchange).pipe(map((exchange) => ({ ...data, exchange }))),
            ),
            switchMap((data) => this.sources.get(data.exchange.source).pipe(map((source) => ({ ...data, source })))),
            switchMap((data) =>
                this.connections.get(data.exchange.connection).pipe(map((connection) => ({ ...data, connection }))),
            ),
            switchMap((data) => this.getPool(data.source).pipe(map((pool) => ({ ...data, pool })))),
            tap((pool) => this.logger.debug(DGTConnectorMSSQL.name, 'Connected to pool', { pool })),
            switchMap((data) => {
                // construct columns part of query
                // e.g. name="Tom Haegemans", points=1760
                let columns = '';
                const triples = _.flatten(
                    data.resources.map((resource) => (resource && resource.triples ? resource.triples : [])),
                );

                triples.forEach((triple) => {
                    const columnName = Object.keys(data.source.configuration.mapping).find(
                        (key) => data.source.configuration.mapping[key] === triple.predicate,
                    );

                    if (columnName) {
                        columns = columns.concat(`${columnName}='${triple.object.value}', `);
                    }
                });

                // remove last comma
                columns = columns.replace(/,\s*$/, '');

                const query = this.renderSelectQuery(data.source.configuration.commands.update, {
                    id: data.connection.configuration.personId,
                    columns,
                });
                // const query = data.source.configuration.commands.update(
                //     data.connection.configuration.personId, columns
                // );
                this.logger.debug(DGTConnectorMSSQL.name, 'Executeing query', query);
                return from(data.pool.request().query(query)).pipe(map((result) => ({ ...data, result })));
            }),
            tap((data) => this.logger.debug(DGTConnectorMSSQL.name, 'Finished UPDATE')),
            map((data) => data.resources.map((entity) => entity)),
            catchError((err) => {
                this.logger.error(DGTConnectorMSSQL.name, 'Error while updating MSSQL', err);
                throw new DGTErrorArgument('Error while updating MSSQL', null);
            }),
        ) as Observable<R[]>;
    }

    public delete<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        // At this points just delete the connection.configuration.personId 's record
        this.logger.debug(DGTConnectorMSSQL.name, 'Starting DELETE, creating connection pool', {
            resources,
            transformer,
        });

        return of({ resources, transformer }).pipe(
            switchMap((data) =>
                this.exchanges.get(_.head(resources).exchange).pipe(map((exchange) => ({ ...data, exchange }))),
            ),
            switchMap((data) => this.sources.get(data.exchange.source).pipe(map((source) => ({ ...data, source })))),
            switchMap((data) =>
                this.connections.get(data.exchange.connection).pipe(map((connection) => ({ ...data, connection }))),
            ),
            switchMap((data) => this.getPool(data.source).pipe(map((pool) => ({ ...data, pool })))),
            tap((data) => this.logger.debug(DGTConnectorMSSQL.name, 'Connected to pool', data)),
            switchMap((data) => {
                const query = this.renderSelectQuery(data.source.configuration.commands.delete, {
                    id: data.connection.configuration.personId,
                });

                this.logger.debug(DGTConnectorMSSQL.name, 'Executeing query', query);
                return from(data.pool.request().query(query)).pipe(map((result) => ({ ...data, result })));
            }),
            tap((data) => this.logger.debug(DGTConnectorMSSQL.name, 'Finished DELETE', { data })),
            map((data) => data.resources),
            catchError(() => {
                this.logger.debug(DGTConnectorMSSQL.name, 'Error while deleteing MSSQL');
                throw new DGTErrorArgument('Error while deleteing MSSQL', null);
            }),
        );
    }

    private add<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<R[]> {
        this.logger.debug(DGTConnectorMSSQL.name, 'Starting ADD, creating connection pool', { resources, transformer });

        return of({ resources, transformer }).pipe(
            switchMap((data) =>
                this.exchanges.get(_.head(resources).exchange).pipe(map((exchange) => ({ ...data, exchange }))),
            ),
            switchMap((data) => this.sources.get(data.exchange.source).pipe(map((source) => ({ ...data, source })))),
            switchMap((data) =>
                this.connections.get(data.exchange.connection).pipe(map((connection) => ({ ...data, connection }))),
            ),
            switchMap((data) => this.getPool(data.source).pipe(map((pool) => ({ ...data, pool })))),
            tap((data) => this.logger.debug(DGTConnectorMSSQL.name, 'Connected to pool', { data })),
            switchMap((data) => {
                let cols = '';
                let values = '';
                Object.keys(data.source.configuration.mapping).forEach((key: string) => {
                    cols += key + ', ';
                    // TEMP TEMP TEMP TEMP TEMP TEMP
                    const temp = resources.find(
                        (e) => e.triples[0].predicate === data.source.configuration.mapping[key],
                    );
                    values += temp ? `'${temp.triples[0].object.value}',` : 'NULL, ';
                });
                const query = this.renderSelectQuery(data.source.configuration.commands.insert, {
                    id: data.connection.configuration.personId,
                    columns: cols.slice(0, -2),
                    values: values.slice(0, -2),
                });

                // data.source.configuration.commands.insert(
                //     data.connection.configuration.personId,
                //     cols.slice(0, -2), values.slice(0, -2)
                // );
                this.logger.debug(DGTConnectorMSSQL.name, 'Executeing query', query);
                return from(data.pool.request().query(query)).pipe(map((result) => ({ ...data, result })));
            }),
            tap((data) => this.logger.debug(DGTConnectorMSSQL.name, 'Finished ADD', { data })),
            map((data) => data.resources),
            catchError(() => {
                this.logger.debug(DGTConnectorMSSQL.name, 'Error while adding MSSQL');
                throw new DGTErrorArgument('Error while adding MSSQL', null);
            }),
        );
    }

    private renderSelectQuery(template: string, templateVars: any): string {
        this.logger.debug(DGTConnectorMSSQL.name, 'Starting to render query', { template, templateVars });

        const query = new Function('return `' + template + '`;').call(templateVars);

        this.logger.debug(DGTConnectorMSSQL.name, 'Rendered query', { template, templateVars, query });

        return query;
    }

    private extractConfig(source: DGTSource<any>) {
        return {
            user: source.configuration.user,
            password: source.configuration.password,
            server: source.configuration.server, // You can use 'localhost\\instance' to connect to named instance
            database: source.configuration.database,

            options: {
                encrypt: false, // Use this if you're on Windows Azure
            },
        };
    }

    private getPool(source: DGTSource<any>): Observable<ConnectionPool> {
        let res: Observable<ConnectionPool> = of(null);

        try {
            const config = this.extractConfig(source);
            this.logger.info(DGTConnectorMSSQL.name, 'Creating connection pool', config);
            const pool = new ConnectionPool(config);
            pool.on('error', (err) => {
                this.logger.error(DGTConnectorMSSQL.name, 'Caught error in connection pool', err);
            });

            res = from(pool.connect());
        } catch (err) {
            this.logger.error(DGTConnectorMSSQL.name, 'Caught error in create connection', { err, source });
            throw new DGTErrorArgument(err, err);
        }
        // let pool: ConnectionPool = this.pools.get(source.uri);

        // if (!this.pools || !pool || !pool.connected) {
        //     try {
        //         const config = this.extractConfig(source);
        //         this.logger.debug(DGTSourceMSSQLConnector.name, 'Creating connection pool');
        //         const pool = new ConnectionPool(config);
        //         pool.on('error', err => {
        //             this.logger.debug(DGTSourceMSSQLConnector.name, 'Caught error in connection pool', err);
        //         });
        //         this.pools.set(source.uri, pool);
        //         this.logger.debug(DGTSourceMSSQLConnector.name, 'Connect to connection pool');
        //         return from(this.pools.get(source.uri).connect()).pipe(
        //             map(() => this.pools.get(source.uri)),
        //         );
        //     } catch (err) {
        //         this.logger.debug(DGTSourceMSSQLConnector.name, 'Caught error in create connection', { err, pools: this.pools, source });
        //         throw new DGTErrorArgument(err, err);
        //     }
        // }

        return res;
    }
}
