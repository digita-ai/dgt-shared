import { DGTConfigurationBaseWeb, DGTPurpose, DGTPurposeService } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationService, DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import * as _ from 'lodash';
import { DGTExchangeRemoteService } from '../../exchanges/services/dgt-exchange-remote.service';
import { map, switchMap } from 'rxjs/operators';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTPurposeRemoteService extends DGTPurposeService {
    constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private http: DGTHttpService, private logger: DGTLoggerService, private config: DGTConfigurationService<DGTConfigurationBaseWeb>) {
        super();
    }
    
    get(uri: string): Observable<DGTPurpose> {
        this.logger.debug(DGTPurposeRemoteService.name, 'Starting to get', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}purpose/${data.uri}` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTPurpose>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }
    query(filter: Partial<DGTPurpose>): Observable<DGTPurpose[]> {
        this.logger.debug(DGTExchangeRemoteService.name, 'Starting to query', { filter });

        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        return of({ filter })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}purpose` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTPurpose[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => _.filter<DGTPurpose>(response.data, filter)),
            );
    }
    save(resource: DGTPurpose): Observable<DGTPurpose> {
        throw new Error('Method not implemented.');
    }
    delete(resource: DGTPurpose): Observable<DGTPurpose> {
        throw new Error('Method not implemented.');
    }

}