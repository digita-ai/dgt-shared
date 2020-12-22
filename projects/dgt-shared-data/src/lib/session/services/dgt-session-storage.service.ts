import { DGTErrorArgument, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { IStorage } from '@inrupt/solid-client-authn-core';
import { EventEmitter } from 'events';
import { map, tap } from 'rxjs/operators';
import { DGTConnectionState } from '../../connection/models/dgt-connection-state.model';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';

@DGTInjectable()
export class DGTSessionStorageService extends EventEmitter implements IStorage {
    public get(sessionId: string): Promise<string> {
        return this.connections.getConnectionBySessionId(sessionId).pipe(
            map(connection => connection ? JSON.stringify(connection.configuration.session.info) : null),
        ).toPromise();
    }
    public set(sessionId: string, value: string): Promise<void> {
        const info = JSON.parse(value);

        const regexMatchedWebId: string[] = info.webId.match('(https?://)(.*?/)(.*)');
        const accountId = regexMatchedWebId[2].replace('/', '');
        const protocol = regexMatchedWebId[1];

        return this.connections.getConnectionBySessionId(sessionId).pipe(
            tap(connection => { if (!connection) { throw new DGTErrorArgument('connection not found', { connection, sessionId }); } }),
            map(connection => ({
                ...connection, configuration: {
                    ...connection.configuration,
                    accountId,
                    protocol,
                    session: { ...connection.configuration.session, info }
                }, state: info.isLoggedIn ? DGTConnectionState.CONNECTED : DGTConnectionState.NOTCONNECTED
            })),
            map(connection => this.connections.save([connection]).subscribe()),
            map(() => { })
        ).toPromise();
    }

    public delete(key: string): Promise<void> {
        return this.connections.get(key).pipe(
            map(connection => this.connections.delete(connection)),
            map(() => { })
        ).toPromise();
    }

    constructor(
        private connections: DGTConnectionService
    ) {
        super();
    }
}
