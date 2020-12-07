import { DGTConnectionSolid, DGTSourceSolid, DGTSourceSolidConfiguration } from '@digita-ai/dgt-shared-data/public-api';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Session, SessionManager } from '@inrupt/solid-client-authn-browser';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@DGTInjectable()
export class DGTOIDCService {
    private manager: SessionManager = new SessionManager();

    constructor(private logger: DGTLoggerService) { }

    public login(source: DGTSourceSolid, connection: DGTConnectionSolid, redirectUrl: string): Observable<void> {
        this.logger.debug(DGTOIDCService.name, 'Starting login', { source });

        if (!source) {
            throw new DGTErrorArgument('Argument source should be set.', source);
        }

        if (!connection) {
            throw new DGTErrorArgument('Argument connection should be set.', connection);
        }

        return of({ source, redirectUrl, connection })
            .pipe(
                switchMap(data => this.getSession(data.connection.configuration.sessionId)
                    .pipe(map(session => ({ ...data, session })))),
                switchMap(data => data.session.login({ oidcIssuer: data.source.configuration.issuer, redirectUrl: data.redirectUrl }))
            )
    }

    public discover(source: DGTSourceSolid): Observable<Partial<DGTSourceSolidConfiguration>> {
        throw new DGTErrorNotImplemented();
    }

    public getSession(sessionId: string): Observable<Session> {
        this.logger.debug(DGTOIDCService.name, 'Getting session', { sessionId });

        if (!sessionId) {
            throw new DGTErrorArgument('Argument sessionId should be set.', sessionId);
        }

        return from(this.manager.getSession(sessionId))
    }
}