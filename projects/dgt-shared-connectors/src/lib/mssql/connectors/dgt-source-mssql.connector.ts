import { Observable, of, from } from 'rxjs';
import * as sql from 'mssql';
import { DGTLDResponse, DGTExchange, DGTSourceConnector, DGTLDTriple, DGTLDPredicate, DGTSource, DGTJustification, DGTConnection, DGTLDNodeType } from '@digita/dgt-shared-data';
import { switchMap, map, tap } from 'rxjs/operators';
import { DGTMap, DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTSourceMSSQLConfiguration } from '../models/dgt-source-mssql-configuration.model';
import { DGTConnectionMSSQLConfiguration } from '../models/dgt-connection-mssql-configuration.model';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTSourceMSSQLConnector implements DGTSourceConnector<DGTSourceMSSQLConfiguration, DGTConnectionMSSQLConfiguration> {

    constructor(private logger: DGTLoggerService) { }

    connect(justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>): Observable<DGTConnection<DGTConnectionMSSQLConfiguration>> {
        return of(null);
    }

    public query(subjectUri: string, justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<DGTConnectionMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>): Observable<DGTLDResponse> {
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
                map(data => this.convertResult(data.result, exchange, source.configuration.mapping, connection)),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Converted results', { data })),
            );
    }

    private convertResult(sqlResult: sql.IResult<any>, exchange: DGTExchange, mapping: DGTMap<string, DGTLDPredicate>, connection: DGTConnection<DGTConnectionMSSQLConfiguration>): DGTLDResponse {
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Converting results', { sqlResult, exchange });
        const values: DGTLDTriple[] = [];

        if (exchange && mapping && sqlResult && sqlResult.recordset) {
            sqlResult.recordset.forEach((record) => {
                if (record) {
                    mapping.forEach((field, key) => {
                        const value = record[key];

                        if (value) {
                            values.push({
                                connection: connection.id,
                                exchange: exchange.id,
                                subject: {
                                    value: exchange.subject,
                                    type: DGTLDNodeType.REFERENCE
                                },
                                source: exchange.source,
                                predicate: field,
                                object: {
                                    value,
                                    type: DGTLDNodeType.LITERAL
                                },
                                originalValue: value,
                            });
                        }
                    });
                }
            });
        }

        return {
            data: values
        };
    }
}
