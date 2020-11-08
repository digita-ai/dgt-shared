import { DGTCategory, DGTCategoryService, DGTConfigurationBaseWeb, DGTLDFilter, DGTLDFilterService } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationService, DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService } from "@digita-ai/dgt-shared-utils";
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTCategoryRemoteService extends DGTCategoryService {
    constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private http: DGTHttpService, private logger: DGTLoggerService, private config: DGTConfigurationService<DGTConfigurationBaseWeb>, private filters: DGTLDFilterService) {
        super();
    }

    get(uri: string): Observable<DGTCategory> {
        this.logger.debug(DGTCategoryRemoteService.name, 'Starting to get', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}category/${data.uri}` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTCategory>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }
    query(filter?: DGTLDFilter): Observable<DGTCategory[]> {
        this.logger.debug(DGTCategoryRemoteService.name, 'Starting to query', { filter });

        return of({ filter })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}category` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTCategory[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })
                    .pipe(map(response => ({ ...data, response })))),
                switchMap(data => data.filter ? this.filters.run<DGTCategory>(data.filter, data.response.data) : of(data.response.data)),
            );
    }
    save(resource: DGTCategory): Observable<DGTCategory> {
        throw new Error('Method not implemented.');
    }
    delete(resource: DGTCategory): Observable<DGTCategory> {
        throw new Error('Method not implemented.');
    }
}
