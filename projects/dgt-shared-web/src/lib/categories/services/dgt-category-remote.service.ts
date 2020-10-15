import { DGTCategory, DGTCategoryService, DGTConfigurationBaseWeb } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationService, DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService } from "@digita-ai/dgt-shared-utils";
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTCategoryRemoteService extends DGTCategoryService {
    constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private http: DGTHttpService, private logger: DGTLoggerService, private config: DGTConfigurationService<DGTConfigurationBaseWeb>) {
        super();
    }
    
    get(id: string): Observable<DGTCategory> {
        this.logger.debug(DGTCategoryRemoteService.name, 'Starting to get', { id });

        if (!id) {
            throw new DGTErrorArgument('Argument id should be set.', id);
        }

        return of({ id })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}category/${data.id}` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTCategory>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }
    query(filter: Partial<DGTCategory>): Observable<DGTCategory[]> {
        this.logger.debug(DGTCategoryRemoteService.name, 'Starting to query', { filter });

        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        return of({ filter })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}category` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTCategory[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => _.filter<DGTCategory>(response.data, filter)),
            );
    }
    save(resource: DGTCategory): Observable<DGTCategory> {
        throw new Error('Method not implemented.');
    }
    delete(resource: DGTCategory): Observable<DGTCategory> {
        throw new Error('Method not implemented.');
    }

}