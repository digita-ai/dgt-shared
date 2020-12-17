import { DGTConnectionSolid, DGTConnectionState, DGTSessionStorageService, DGTSourceSolid } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Session, SessionManager } from '@inrupt/solid-client-authn-browser';
import { from, Observable, of } from 'rxjs';

@DGTInjectable()
export class DGTOIDCService {
    private manager: SessionManager = new SessionManager({ secureStorage: this.storage });
    constructor(
        private storage: DGTSessionStorageService,
        private logger: DGTLoggerService,
    ) { }

    public getSession(sessionId: string): Observable<Session> {
        this.logger.debug(DGTOIDCService.name, 'Getting session', { sessionId });
        return from(this.manager.getSession(sessionId));
    }

    public getSessionByConnection(connection: DGTConnectionSolid): Observable<Session> {
        this.logger.debug(DGTOIDCService.name, 'Getting session', { connection });
        return from(this.manager.getSession(connection.configuration.sessionId));
    }

    public connect(source: DGTSourceSolid, connection: DGTConnectionSolid): void {
        this.logger.debug(DGTOIDCService.name, 'Starting login', { source, connection });

        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        const session = new Session({ secureStorage: this.storage }, connection.configuration.sessionId);

        session.handleIncomingRedirect(source.configuration.callbackUri);

        if (!session.info.isLoggedIn) {
            session.login({ oidcIssuer: source.configuration.issuer, redirectUrl: source.configuration.callbackUri });
        }
    }
}
