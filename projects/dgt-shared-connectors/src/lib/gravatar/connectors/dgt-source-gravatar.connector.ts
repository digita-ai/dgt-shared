import { Observable, of } from 'rxjs';
import { DGTSourceConnector, DGTExchange, DGTLDResponse, DGTSource, DGTLDValue, DGTJustification, DGTProvider } from '@digita/dgt-shared-data';
import { DGTSourceGravatarConfiguration } from '../models/dgt-source-gravatar-configuration.model';
import { DGTLoggerService, DGTHttpService } from '@digita/dgt-shared-utils';
import { Md5 } from 'ts-md5/dist/md5';
import { DGTSourceGravatarResponse } from '../models/dgt-source-gravatar-response.model';
import { DGTHttpResponse } from '@digita/dgt-shared-utils/lib/http/models/dgt-http-response.model';
import { map, tap } from 'rxjs/operators';
import { DGTProviderGravatarConfiguration } from '../models/dgt-provider-gravatar-configuration.model';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTSourceGravatarConnector implements DGTSourceConnector<DGTSourceGravatarConfiguration, DGTProviderGravatarConfiguration> {
    constructor(private logger: DGTLoggerService, private http: DGTHttpService) { }

    connect(justification: DGTJustification, exchange: DGTExchange, provider: DGTProvider<DGTProviderGravatarConfiguration>, source: DGTSource<DGTSourceGravatarConfiguration>): Observable<DGTProvider<DGTProviderGravatarConfiguration>> {
        return of(null);
    }

    public query(justification: DGTJustification, exchange: DGTExchange, provider: DGTProvider<DGTProviderGravatarConfiguration>, source: DGTSource<DGTSourceGravatarConfiguration>): Observable<DGTLDResponse> {
        this.logger.debug(DGTSourceGravatarConnector.name, 'Starting query', { exchange, source });

        let res = null;

        if (exchange && source) {
            const hash = Md5.hashStr(exchange.uri);
            const uri = `https://www.gravatar.com/${hash}.json`;

            res = this.http.get<DGTSourceGravatarResponse>(uri)
                .pipe(
                    tap(data => this.logger.debug(DGTSourceGravatarConnector.name, 'Received response from Gravatar', { data })),
                    map(data => this.convertResponse(data, exchange, source, provider)),
                    tap(data => this.logger.debug(DGTSourceGravatarConnector.name, 'Converted response from Gravatar', { data })),
                );
        }

        return res;
    }

    private convertResponse(httpResponse: DGTHttpResponse<DGTSourceGravatarResponse>, exchange: DGTExchange, source: DGTSource<DGTSourceGravatarConfiguration>, provider: DGTProvider<DGTProviderGravatarConfiguration>): DGTLDResponse {
        const res: DGTLDValue[] = [];

        this.logger.debug(DGTSourceGravatarConnector.name, 'Starting conversion of Gravatar response', { httpResponse, exchange, source, provider });

        if (exchange && source && httpResponse && httpResponse.success && httpResponse.data && httpResponse.data.entry && httpResponse.data.entry[0]) {
            const entry = httpResponse.data.entry[0];

            this.logger.debug(DGTSourceGravatarConnector.name, 'Found entry', { entry });

            if (entry.preferredUsername) {
                this.logger.debug(DGTSourceGravatarConnector.name, 'Found username', { entry });
                res.push({
                    exchange: exchange.id,
                    subject: exchange.subject,
                    source: exchange.source,
                    field: source.configuration.usernameField,
                    value: entry.preferredUsername,
                    originalValue: entry.preferredUsername,
                    provider: provider.id
                });
            }

            if (entry.thumbnailUrl) {
                this.logger.debug(DGTSourceGravatarConnector.name, 'Found thumbnail', { entry });
                res.push({
                    exchange: exchange.id,
                    subject: exchange.subject,
                    source: exchange.source,
                    field: source.configuration.thumbnailField,
                    value: entry.thumbnailUrl,
                    originalValue: entry.thumbnailUrl,
                    provider: provider.id
                });
            }
        }

        return {
            data: res
        };
    }
}
