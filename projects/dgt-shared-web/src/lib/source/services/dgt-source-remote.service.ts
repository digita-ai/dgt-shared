import { DGTLDFilter, DGTLDFilterService, DGTSource, DGTSourceService } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationBaseWeb, DGTConfigurationService, DGTErrorArgument, DGTErrorNotImplemented, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of, zip } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';

@DGTInjectable()
export class DGTSourceRemoteService extends DGTSourceService {
    constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private http: DGTHttpService, private logger: DGTLoggerService, private config: DGTConfigurationService<DGTConfigurationBaseWeb>, private filters: DGTLDFilterService) {
        super();
    }

    get(uri: string): Observable<DGTSource<any>> {
        this.logger.debug(DGTSourceRemoteService.name, 'Starting to get', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}source/${encodeURIComponent(data.uri)}` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTSource<any>>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }
    query(filter?: DGTLDFilter): Observable<DGTSource<any>[]> {
        this.logger.debug(DGTSourceRemoteService.name, 'Starting to query', { filter });

        return of({ filter })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}source` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTSource<any>[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })
                    .pipe(map(response => ({ ...data, response })))),
                switchMap(data => data.filter ? this.filters.run<DGTSource<any>>(data.filter, data.response.data) : of(data.response.data)),
            );
    }
    save(resources: DGTSource<any>[]): Observable<DGTSource<any>[]> {
        this.logger.debug(DGTSourceRemoteService.name, 'Starting to save', { resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        return of({ resources }).pipe(
            switchMap(data => zip(...data.resources.map(resource => this.saveOne(resource)))),
        );
    }
    private saveOne(resource: DGTSource<any>): Observable<DGTSource<any>> {
        return of({resource}).pipe(
            map(data => ({...data, uri: data.resource.uri
                ? `${this.config.get(c => c.server.uri)}source/${encodeURIComponent(data.resource.uri)}`
                : `${this.config.get(c => c.server.uri)}source`})),
            switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
            switchMap(data => data.resource.uri
                ? this.http.put<DGTSource<any>>(data.uri, resource, { Authorization: `Bearer ${data.accessToken}` })
                : this.http.post<DGTSource<any>>(data.uri, resource, { Authorization: `Bearer ${data.accessToken}` }),
                ),
            map(response => response.data),
        ) as Observable<DGTSource<any>>
    }

    delete(resource: DGTSource<any>): Observable<DGTSource<any>> {
        throw new DGTErrorNotImplemented();
    }
    linkSource(inviteId: string, sourceId: string): Observable<{ state: string; loginUri: string; }> {
        throw new DGTErrorNotImplemented();
    }
}
