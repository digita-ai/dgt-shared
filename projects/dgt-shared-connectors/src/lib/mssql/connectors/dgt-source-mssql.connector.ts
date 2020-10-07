import { Observable, of, from } from 'rxjs';
import * as sql from 'mssql';
import { DGTExchange, DGTPurpose, DGTSourceConnector, DGTLDTriple, DGTSource, DGTConnection, DGTLDTermType, DGTLDResource, DGTLDTransformer } from '@digita-ai/dgt-shared-data';
import { switchMap, map, tap } from 'rxjs/operators';
import { DGTMap, DGTLoggerService, DGTErrorNotImplemented } from '@digita-ai/dgt-shared-utils';
import { DGTSourceMSSQLConfiguration } from '../models/dgt-source-mssql-configuration.model';
import { DGTConnectionMSSQLConfiguration } from '../models/dgt-connection-mssql-configuration.model';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTSourceMSSQLConnector extends DGTSourceConnector<DGTSourceMSSQLConfiguration, DGTConnectionMSSQLConfiguration> {

    constructor(private logger: DGTLoggerService) {
        super();
    }

    connect(purpose: DGTPurpose, exchange: DGTExchange, connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>): Observable<DGTConnection<DGTConnectionMSSQLConfiguration>> {
        return of(null);
    }

    public query<T extends DGTLDResource>(holderUri: string, purpose: DGTPurpose, exchange: DGTExchange, connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>, transformer: DGTLDTransformer<T> = null): Observable<T[]> {
        const config = {
            user: source.configuration.user,
            password: source.configuration.password,
            server: source.configuration.server, // You can use 'localhost\\instance' to connect to named instance
            database: source.configuration.database,

            options: {
                encrypt: false // Use this if you're on Windows Azure
            }
        };

        this.logger.debug(DGTSourceMSSQLConnector.name, 'Starting query, creating connection pool', {
            exchange,
            source
        });

        const pool = new sql.ConnectionPool(config);

        this.logger.debug(DGTSourceMSSQLConnector.name, 'Created connection pool', { pool });

        return of({ pool, config })
            .pipe(
                switchMap(data => from(data.pool.connect())
                    .pipe(map(newPool => ({ newPool, ...data })))
                ),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Connected to pool', { data })),
                switchMap(data => from(data.pool.request().query(source.configuration.command(connection.configuration.personId)))
                    .pipe(map(result => ({ result, ...data })))),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished query', { data })),
                map(data => this.convertResult(holderUri, data.result, exchange, source.configuration.mapping, connection)),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Converted results', { data })),
                switchMap((entity: DGTLDResource) => transformer ? transformer.toDomain([entity]) : (of([entity] as T[])))
            );
    }

    private convertResult(uri: string, sqlResult: sql.IResult<any>, exchange: DGTExchange, mapping: DGTMap<string, string>, connection: DGTConnection<DGTConnectionMSSQLConfiguration>): DGTLDResource {
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

    public update<R extends DGTLDResource>(domainEntities: { original: R, updated: R }[], connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>, transformer: DGTLDTransformer<R>): Observable<R[]> {
        throw new DGTErrorNotImplemented();
    }

    public delete<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>, transformer: DGTLDTransformer<R>): Observable<R[]> {
        throw new DGTErrorNotImplemented();
    }

    public add<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>, transformer: DGTLDTransformer<R>): Observable<R[]> {
        throw new DGTErrorNotImplemented();
    }
}
