import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { IStorage } from '@inrupt/solid-client-authn-core';
import { EventEmitter } from 'events';
import { map, tap } from 'rxjs/operators';
import { DGTConnectionState } from '../../connection/models/dgt-connection-state.model';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';

@DGTInjectable()
export class DGTSessionStorageService extends EventEmitter implements IStorage {
    public get(sessionId: string): Promise<string> {
        this.logger.debug(DGTSessionStorageService.name, 'Getting session', { sessionId });

        if (!sessionId) {
            throw new DGTErrorArgument('Argument sessionId should be set.', sessionId);
        }

        return this.connections
            .getConnectionBySessionId(sessionId)
            .pipe(map((connection) => (connection ? JSON.stringify(connection.configuration.sessionInfo) : null)))
            .toPromise();
    }
    public set(sessionId: string, value: string): Promise<void> {
        this.logger.debug(DGTSessionStorageService.name, 'Setting session', { sessionId, value });

        if (!sessionId) {
            throw new DGTErrorArgument('Argument sessionId should be set.', sessionId);
        }

        if (!value) {
            throw new DGTErrorArgument('Argument value should be set.', value);
        }

        const sessionInfo = JSON.parse(value);

        const regexMatchedWebId: string[] = sessionInfo.webId.match('(https?://)(.*?/)(.*)');
        const accountId = regexMatchedWebId[2].replace('/', '');
        const protocol = regexMatchedWebId[1];

        return this.connections
            .getConnectionBySessionId(sessionId)
            .pipe(
                tap((connection) => {
                    if (!connection) {
                        throw new DGTErrorArgument('connection not found', { connection, sessionId });
                    }
                }),
                map((connection) => ({
                    ...connection,
                    configuration: {
                        ...connection.configuration,
                        accountId,
                        protocol,
                        sessionInfo,
                    },
                    state: sessionInfo.isLoggedIn ? DGTConnectionState.CONNECTED : DGTConnectionState.NOTCONNECTED,
                })),
                map((connection) => this.connections.save([connection]).subscribe()),
                map(() => {}),
            )
            .toPromise();
    }

    public delete(sessionId: string): Promise<void> {
        this.logger.debug(DGTSessionStorageService.name, 'Deleting session', { sessionId });

        if (!sessionId) {
            throw new DGTErrorArgument('Argument sessionId should be set.', sessionId);
        }

        return this.connections
            .getConnectionBySessionId(sessionId)
            .pipe(
                map((connection) => this.connections.delete(connection)),
                map(() => {}),
            )
            .toPromise();
    }

    constructor(private connections: DGTConnectionService, private logger: DGTLoggerService) {
        super();
    }
}
