import { DGTConnectionService, DGTConnectionSolid, DGTConnectionState, DGTSessionStorageService, DGTSourceSolid } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { ISessionInfo, Session, SessionManager } from '@inrupt/solid-client-authn-browser';
import { from, Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

@DGTInjectable()
export class DGTOIDCService {
    private manager: SessionManager;
    constructor(
        private storage: DGTSessionStorageService,
        private logger: DGTLoggerService,
        private connections: DGTConnectionService,
    ) {
        this.manager = new SessionManager({ secureStorage: this.storage });
    }

    public getSession(sessionId: string): Observable<Session> {
        return from(this.manager.hasSession(sessionId)).pipe(mergeMap(exists => {
            return exists ? this.manager.getSession(sessionId) : of(null);
        }));
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


        this.connections.save([{ ...connection, state: DGTConnectionState.CONNECTING }]);

        if (!session.info.isLoggedIn) {
            session.login({ oidcIssuer: source.configuration.issuer, redirectUrl: source.configuration.callbackUri });
        }
    }

    public handleIncomingRedirect(connection: DGTConnectionSolid): Observable<ISessionInfo> {
        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        const conn = { ...connection };

        return this.getSession(conn.configuration.sessionId).pipe(mergeMap(session => {
            if (session) {
                return from(session.handleIncomingRedirect(window.location.href)).pipe(tap(sessionInfo => {
                    this.logger.debug(DGTOIDCService.name, 'Retrieved sessionInfo', sessionInfo);
                }));
            }
        }));
    }
}
