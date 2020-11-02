import { DGTSource, DGTSourceService, DGTConfigurationBaseWeb } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationService, DGTErrorArgument, DGTErrorNotImplemented, DGTHttpService, DGTInjectable, DGTLoggerService } from "@digita-ai/dgt-shared-utils";
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTSourceRemoteService extends DGTSourceService {
    constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private http: DGTHttpService, logger: DGTLoggerService, private config: DGTConfigurationService<DGTConfigurationBaseWeb>) {
        super(logger);
    }

    get(uri: string): Observable<DGTSource<any>> {
        this.logger.debug(DGTSourceRemoteService.name, 'Starting to get', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}source/${data.uri}` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTSource<any>>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }
    query(filter: Partial<DGTSource<any>>): Observable<DGTSource<any>[]> {
        this.logger.debug(DGTSourceRemoteService.name, 'Starting to query', { filter });

        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        return of({ filter })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}source` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTSource<any>[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => _.filter<DGTSource<any>>(response.data, filter)),
            );
    }
    save(resource: DGTSource<any>): Observable<DGTSource<any>> {
        throw new DGTErrorNotImplemented();
    }
    delete(resource: DGTSource<any>): Observable<DGTSource<any>> {
        throw new DGTErrorNotImplemented();
    }
    linkSource(inviteId: string, sourceId: string): Observable<{ state: string; loginUri: string; }> {
        throw new DGTErrorNotImplemented();
    }
}