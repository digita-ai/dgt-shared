import { DGTConnectionService, DGTConnectionSolid, DGTConnectionState, DGTSessionStorageService, DGTSourceSolid } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { ISessionInfo, Session, SessionManager } from '@inrupt/solid-client-authn-browser';
import { from, Observable, of } from 'rxjs';
import { mergeMap, take, tap } from 'rxjs/operators';

@DGTInjectable()
export class DGTOIDCService {
    private manager: SessionManager;
    constructor(
        private storage: DGTSessionStorageService,
        private logger: DGTLoggerService,
        private connections: DGTConnectionService,
    ) {
        this.manager = new SessionManager();
    }

    public getSession(sessionId: string): Observable<Session> {
        return from(this.manager.getSession(sessionId));
    }

    public connect(source: DGTSourceSolid, connection: DGTConnectionSolid): void {
        this.logger.debug(DGTOIDCService.name, 'Starting login', { source, connection });

        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        const session = new Session();

        this.connections.save([{ ...connection, state: DGTConnectionState.CONNECTING, configuration: { ...connection.configuration, sessionInfo: session.info } }]);

        if (!session.info.isLoggedIn) {
            session.login({ oidcIssuer: source.configuration.issuer, redirectUrl: source.configuration.callbackUri });
        }
    }

    public handleIncomingRedirect(connection: DGTConnectionSolid): Observable<ISessionInfo> {
        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        return this.getSession(connection.configuration.sessionInfo.sessionId).pipe(mergeMap(session => {
            if (session) {
                return from(session.handleIncomingRedirect(window.location.href)).pipe(tap(sessionInfo => {
                    this.logger.debug(DGTOIDCService.name, 'Retrieved sessionInfo', sessionInfo);
                }), take(1));
            } else {
                throw new DGTErrorArgument('Session not found.', session);
            }
        }));
    }
}
