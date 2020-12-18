import { DGTConfigurationBaseWeb, DGTConfigurationService, DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTConnectionSolid } from '../../connection/models/dgt-connection-solid.model';

@DGTInjectable()
export class DGTSecurityService {

    constructor(private http: DGTHttpService, private logger: DGTLoggerService, private config: DGTConfigurationService<DGTConfigurationBaseWeb>) { }

    public loginWithSolid(connection: DGTConnectionSolid): Observable<string> {
        this.logger.debug(DGTSecurityService.name, 'Starting to login with Solid', { connection });

        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        return of({ connection })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}security/login/solid` })),
                switchMap(data => this.http.post<any>(data.uri, null, { Authorization: `Bearer ${data.connection.configuration.accessToken}` })),
                map(response => response.data.access_token),
            )
    }
}
