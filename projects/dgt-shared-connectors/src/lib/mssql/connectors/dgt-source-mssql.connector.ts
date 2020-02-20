import { Observable, of, from } from 'rxjs';
import * as sql from 'mssql';
import { DGTLDResponse, DGTExchange, DGTSourceConnector, DGTLDValue, DGTLDField, DGTSource, DGTJustification, DGTProvider } from '@digita/dgt-shared-data';
import { switchMap, map, tap } from 'rxjs/operators';
import { DGTMap, DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTSourceMSSQLConfiguration } from '../models/dgt-source-mssql-configuration.model';
import { DGTProviderMSSQLConfiguration } from '../models/dgt-provider-mssql-configuration.model';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTSourceMSSQLConnector implements DGTSourceConnector<DGTSourceMSSQLConfiguration, DGTProviderMSSQLConfiguration> {

    constructor(private logger: DGTLoggerService) { }

    connect(justification: DGTJustification, exchange: DGTExchange, provider: DGTProvider<DGTProviderMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>): Observable<DGTProvider<DGTProviderMSSQLConfiguration>> {
        return of(null);
    }

    public query(justification: DGTJustification, exchange: DGTExchange, provider: DGTProvider<DGTProviderMSSQLConfiguration>, source: DGTSource<DGTSourceMSSQLConfiguration>): Observable<DGTLDResponse> {
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
                switchMap(data => from(data.pool.request().query(source.configuration.command(provider.configuration.personId)))
                .pipe(map(result => ({ result, ...data })))),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Finished query', { data })),
                map(data => this.convertResult(data.result, exchange, source.configuration.mapping, provider)),
                tap(data => this.logger.debug(DGTSourceMSSQLConnector.name, 'Converted results', { data })),
            );
    }

    private convertResult(sqlResult: sql.IResult<any>, exchange: DGTExchange, mapping: DGTMap<string, DGTLDField>, provider: DGTProvider<DGTProviderMSSQLConfiguration>): DGTLDResponse {
        this.logger.debug(DGTSourceMSSQLConnector.name, 'Converting results', { sqlResult, exchange });
        const values: DGTLDValue[] = [];

        if (exchange && mapping && sqlResult && sqlResult.recordset) {
            sqlResult.recordset.forEach((record) => {
                if (record) {
                    mapping.forEach((field, key) => {
                        const value = record[key];

                        if (value) {
                            values.push({
                                provider: provider.id,
                                exchange: exchange.id,
                                subject: exchange.subject,
                                source: exchange.source,
                                field,
                                value,
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
