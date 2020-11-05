import { DGTConfigurationService, DGTErrorArgument, DGTErrorNotImplemented, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { DGTHolder, DGTHolderService, DGTConfigurationBaseWeb } from '@digita-ai/dgt-shared-data';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTHolderRemoteService extends DGTHolderService {
    constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private http: DGTHttpService, private logger: DGTLoggerService, private config: DGTConfigurationService<DGTConfigurationBaseWeb>) {
        super();
    }

    public get(uri: string): Observable<DGTHolder> {
        this.logger.debug(DGTHolderRemoteService.name, 'Starting to get', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}holder/${data.uri}` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTHolder>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }

    public query(filter: Partial<DGTHolder>): Observable<DGTHolder[]> {
        this.logger.debug(DGTHolderRemoteService.name, 'Starting to query', { filter });

        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        return of({ filter })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}holder` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTHolder[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => _.filter<DGTHolder>(response.data, filter)),
            );
    }

    public save(resource: DGTHolder): Observable<DGTHolder> {
        throw new DGTErrorNotImplemented();
    }

    public delete(resource: DGTHolder): Observable<DGTHolder> {
        throw new DGTErrorNotImplemented();
    }
}