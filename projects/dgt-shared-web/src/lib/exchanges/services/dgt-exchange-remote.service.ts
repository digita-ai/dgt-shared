import { DGTExchange, DGTExchangeService, DGTConfigurationBaseWeb } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationService, DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService } from "@digita-ai/dgt-shared-utils";
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTExchangeRemoteService extends DGTExchangeService {
    constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private http: DGTHttpService, private logger: DGTLoggerService, private config: DGTConfigurationService<DGTConfigurationBaseWeb>) {
        super();
    }
    
    get(uri: string): Observable<DGTExchange> {
        this.logger.debug(DGTExchangeRemoteService.name, 'Starting to get', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}exchange/${data.uri}` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTExchange>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }
    query(filter: Partial<DGTExchange>): Observable<DGTExchange[]> {
        this.logger.debug(DGTExchangeRemoteService.name, 'Starting to query', { filter });

        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        return of({ filter })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}exchange` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTExchange[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => _.filter<DGTExchange>(response.data, filter)),
            );
    }
    save(resource: DGTExchange): Observable<DGTExchange> {
        throw new Error('Method not implemented.');
    }
    delete(resource: DGTExchange): Observable<DGTExchange> {
        throw new Error('Method not implemented.');
    }

}