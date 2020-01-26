import { Observable } from 'rxjs';
import { DGTSourceConnector, DGTExchange, DGTJustification, DGTLDResponse, DGTSource, DGTLDValue } from '@digita/dgt-shared-data';
import { DGTSourceGravatarConfiguration } from '../models/dgt-source-gravatar-configuration.model';
import { DGTLoggerService, DGTHttpService } from '@digita/dgt-shared-utils';
import { Md5 } from 'ts-md5/dist/md5';
import { DGTSourceGravatarResponse } from '../models/dgt-source-gravatar-response.model';
import { DGTHttpResponse } from '@digita/dgt-shared-utils/lib/http/models/dgt-http-response.model';
import { map, tap } from 'rxjs/operators';

export class DGTSourceGravatarConnector implements DGTSourceConnector<DGTSourceGravatarConfiguration> {
    constructor(private logger: DGTLoggerService, private http: DGTHttpService) { }

    public query(
        exchange: DGTExchange,
        justification: DGTJustification,
        source: DGTSource<DGTSourceGravatarConfiguration>
    ): Observable<DGTLDResponse> {
        this.logger.debug(DGTSourceGravatarConnector.name, 'Starting query', { exchange, justification, source });

        let res = null;

        if (exchange && justification && source) {
            const hash = Md5.hashStr(exchange.uri);
            const uri = `https://www.gravatar.com/${hash}.json`;

            res = this.http.get<DGTSourceGravatarResponse>(uri)
                .pipe(
                    tap(data => this.logger.debug(DGTSourceGravatarConnector.name, 'Received response from Gravatar', { data })),
                    map(data => this.convertResponse(data, exchange, source)),
                    tap(data => this.logger.debug(DGTSourceGravatarConnector.name, 'Converted response from Gravatar', { data })),
                );
        }

        return res;
    }

    private convertResponse(httpResponse: DGTHttpResponse<DGTSourceGravatarResponse>, exchange: DGTExchange, source: DGTSource<DGTSourceGravatarConfiguration>): DGTLDResponse {
        const res: DGTLDValue[] = [];

        this.logger.debug(DGTSourceGravatarConnector.name, 'Starting conversion of Gravatar response', { httpResponse, exchange, source });

        if (exchange && source && httpResponse && httpResponse.success && httpResponse.data && httpResponse.data.entry && httpResponse.data.entry[0]) {
            const entry = httpResponse.data.entry[0];

            this.logger.debug(DGTSourceGravatarConnector.name, 'Found entry', { entry });

            if (entry.preferredUsername) {
                this.logger.debug(DGTSourceGravatarConnector.name, 'Found username', { entry });
                res.push({
                    exchange: exchange.id,
                    subject: exchange.subject,
                    field: source.configuration.usernameField,
                    value: entry.preferredUsername
                });
            }

            if (entry.thumbnailUrl) {
                this.logger.debug(DGTSourceGravatarConnector.name, 'Found thumbnail', { entry });
                res.push({
                    exchange: exchange.id,
                    subject: exchange.subject,
                    field: source.configuration.thumbnailField,
                    value: entry.thumbnailUrl
                });
            }
        }

        return {
            data: res
        };
    }
}
