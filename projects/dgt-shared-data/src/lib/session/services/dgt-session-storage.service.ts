import { DGTErrorArgument, DGTInjectable } from '@digita-ai/dgt-shared-utils/public-api';
import { IStorage } from '@inrupt/solid-client-authn-core';
import { EventEmitter } from 'events';
import { map, mergeMap, tap } from 'rxjs/operators';
import { DGTConnectionState } from '../../connection/models/dgt-connection-state.model';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';

@DGTInjectable()
export class DGTSessionStorageService extends EventEmitter implements IStorage {
    public get(key: string): Promise<string> {
        return this.connections.get(key).pipe(mergeMap(connection =>
            JSON.stringify({
                accessToken: connection.configuration.accessToken,
                idToken: connection.configuration.idToken,
                isLoggedIn: connection.state === DGTConnectionState.CONNECTED,
                webId: connection.configuration.webId,
                refreshToken: connection.configuration.refreshToken,
                sessionId: connection.configuration.sessionId,
            })
        )).toPromise();
    }
    public set(key: string, value: string): Promise<void> {
        const jsonValue = JSON.parse(value);
        const configuration = ({
            accessToken: jsonValue.accessToken,
            idToken: jsonValue.idToken,
            webId: jsonValue.webId,
            refreshToken: jsonValue.refreshToken,
            sessionId: key,
        });

        return this.connections.get(key).pipe(
            tap(connection => { if (!connection) { throw new DGTErrorArgument('connection not found', connection); } }),
            map(connection => ({ ...connection, configuration, state: jsonValue.isLoggedIn ? DGTConnectionState.CONNECTED : DGTConnectionState.NOTCONNECTED })),
            map(connection => this.connections.save([connection])),
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
