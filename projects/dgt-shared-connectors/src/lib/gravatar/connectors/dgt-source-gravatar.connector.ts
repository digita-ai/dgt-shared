import { Observable, of } from 'rxjs';
import { DGTSourceConnector, DGTExchange, DGTSource, DGTLDTriple, DGTJustification, DGTConnection, DGTLDTermType, DGTLDResource, DGTLDTransformer } from '@digita/dgt-shared-data';
import { DGTSourceGravatarConfiguration } from '../models/dgt-source-gravatar-configuration.model';
import { DGTLoggerService, DGTHttpService } from '@digita/dgt-shared-utils';
import { Md5 } from 'ts-md5/dist/md5';
import { DGTSourceGravatarResponse } from '../models/dgt-source-gravatar-response.model';
import { DGTHttpResponse } from '@digita/dgt-shared-utils/lib/http/models/dgt-http-response.model';
import { map, tap, switchMap } from 'rxjs/operators';
import { DGTConnectionGravatarConfiguration } from '../models/dgt-connection-gravatar-configuration.model';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTSourceGravatarConnector implements DGTSourceConnector<DGTSourceGravatarConfiguration, DGTConnectionGravatarConfiguration> {
    constructor(private logger: DGTLoggerService, private http: DGTHttpService) { }

    connect(justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<DGTConnectionGravatarConfiguration>, source: DGTSource<DGTSourceGravatarConfiguration>): Observable<DGTConnection<DGTConnectionGravatarConfiguration>> {
        return of(null);
    }

    public query<T extends DGTLDResource>(holderUri: string, justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<DGTConnectionGravatarConfiguration>, source: DGTSource<DGTSourceGravatarConfiguration>, transformer: DGTLDTransformer<T> = null): Observable<T[]> {
        this.logger.debug(DGTSourceGravatarConnector.name, 'Starting query', { exchange, source });

        let res = null;

        if (exchange && source) {
            const hash = Md5.hashStr(connection.configuration.email);
            const uri = `https://www.gravatar.com/${hash}.json`;

            res = this.http.get<DGTSourceGravatarResponse>(uri)
                .pipe(
                    tap(data => this.logger.debug(DGTSourceGravatarConnector.name, 'Received response from Gravatar', { data })),
                    map(data => this.convertResponse(holderUri, data, exchange, source, connection)),
                    tap(data => this.logger.debug(DGTSourceGravatarConnector.name, 'Converted response from Gravatar', { data })),
                    switchMap((entity: DGTLDResource) => transformer ? transformer.toDomain([entity]) : (of([entity] as T[]))),
                );
        }

        return res;
    }

    private convertResponse(holderUri: string, httpResponse: DGTHttpResponse<DGTSourceGravatarResponse>, exchange: DGTExchange, source: DGTSource<DGTSourceGravatarConfiguration>, connection: DGTConnection<DGTConnectionGravatarConfiguration>): DGTLDResource {
        const triples: DGTLDTriple[] = [];

        this.logger.debug(DGTSourceGravatarConnector.name, 'Starting conversion of Gravatar response', { httpResponse, exchange, source, connection });

        if (exchange && source && httpResponse && httpResponse.success && httpResponse.data && httpResponse.data.entry && httpResponse.data.entry[0]) {
            const entry = httpResponse.data.entry[0];

            this.logger.debug(DGTSourceGravatarConnector.name, 'Found entry', { entry });

            if (entry.preferredUsername) {
                this.logger.debug(DGTSourceGravatarConnector.name, 'Found username', { entry });
                triples.push({
                    exchange: exchange.id,
                    subject: {
                        value: exchange.holder,
                        termType: DGTLDTermType.REFERENCE
                    },
                    source: exchange.source,
                    predicate: source.configuration.usernameField,
                    object: {
                        value: entry.preferredUsername,
                        termType: DGTLDTermType.LITERAL
                    },
                    originalValue: {
                        value: entry.preferredUsername,
                        termType: DGTLDTermType.LITERAL
                    },
                    connection: connection.id
                });
            }

            if (entry.thumbnailUrl) {
                this.logger.debug(DGTSourceGravatarConnector.name, 'Found thumbnail', { entry });
                triples.push({
                    exchange: exchange.id,
                    subject: {
                        value: exchange.holder,
                        termType: DGTLDTermType.REFERENCE
                    },
                    source: exchange.source,
                    predicate: source.configuration.thumbnailField,
                    object: {
                        value: entry.thumbnailUrl,
                        termType: DGTLDTermType.LITERAL
                    },
                    originalValue: {
                        value: entry.thumbnailUrl,
                        termType: DGTLDTermType.LITERAL
                    },
                    connection: connection.id
                });
            }
        }

        return {
            triples,
            connection: connection.id,
            source: connection.source,
            documentUri: holderUri,
            holder: {
                value: holderUri,
                termType: DGTLDTermType.REFERENCE
            },
        };
    }
}
