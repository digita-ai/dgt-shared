import { DGTConnectionSolid, DGTSessionStorageService, DGTSourceSolid } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Session, SessionManager } from '@inrupt/solid-client-authn-browser';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@DGTInjectable()
export class DGTOIDCService {
    private manager: SessionManager = new SessionManager({ secureStorage: this.storage });
    constructor(
        private storage: DGTSessionStorageService,
        private logger: DGTLoggerService,
    ) { }

    public getSession(sessionId: string): Observable<Session> {
        this.logger.debug(DGTOIDCService.name, 'Getting session', { sessionId });

        if (!sessionId) {
            throw new DGTErrorArgument('Argument sessionId should be set.', sessionId);
        }

        return from(this.manager.getSession(sessionId));
    }

    public getSessionByConnection(connection: DGTConnectionSolid): Observable<Session> {
        this.logger.debug(DGTOIDCService.name, 'Getting session', connection.configuration.sessionId);

        if (!connection || !connection.configuration || !connection.configuration.sessionId) {
            throw new DGTErrorArgument('Argument connection should be set.', connection.configuration.sessionId);
        }

        return from(this.manager.getSession(connection.session));
    }

    public connect(source: DGTSourceSolid, connection: DGTConnectionSolid): Observable<void> {
        this.logger.debug(DGTOIDCService.name, 'Starting login', { source });

        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        return of({ source, connection })
            .pipe(
                switchMap(data => this.getSessionByConnection(data.connection)
                    .pipe(map(session => ({ ...data, session })))),
                switchMap(data => data.session.login({ oidcIssuer: data.source.configuration.issuer, redirectUrl: data.source.configuration.callbackUri }))
            );
    }
}
