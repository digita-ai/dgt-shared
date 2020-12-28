import { DGTHolder, DGTHolderService, DGTLDFilter, DGTLDFilterService, DGTSparqlResult } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationBaseWeb, DGTConfigurationService, DGTErrorArgument, DGTErrorNotImplemented, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';

@DGTInjectable()
export class DGTHolderRemoteService extends DGTHolderService {
    constructor(
        private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
        private http: DGTHttpService,
        private logger: DGTLoggerService,
        private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
        private filters: DGTLDFilterService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTHolder> {
        this.logger.debug(DGTHolderRemoteService.name, 'Starting to get', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}holder/${encodeURIComponent(data.uri)}` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTHolder>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }

    public query(filter?: DGTLDFilter): Observable<DGTHolder[]> {
        this.logger.debug(DGTHolderRemoteService.name, 'Starting to query', { filter });

        return of({ filter })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}holder` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTHolder[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })
                    .pipe(map(response => ({ ...data, response })))),
                switchMap(data => data.filter ? this.filters.run<DGTHolder>(data.filter, data.response.data) : of(data.response.data)),
            );
    }

    public saveMultiple(resources: DGTHolder[]): Observable<DGTHolder[]> {
        this.logger.debug(DGTHolderRemoteService.name, 'Starting to save resource', { resources });

        throw new DGTErrorNotImplemented();
    }

    public save(resources: DGTHolder[]): Observable<DGTHolder[]> {
        this.logger.debug(DGTHolderRemoteService.name, 'Starting to save', { resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        return of({ resources })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}holder` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => forkJoin(resources.map(resource => this.http.post<DGTHolder>(data.uri, resource, { Authorization: `Bearer ${data.accessToken}` })
                    .pipe(map(response => response.data))))),
            );
    }

    public delete(resource: DGTHolder): Observable<DGTHolder> {
        throw new DGTErrorNotImplemented();
    }

    public getExtraInfo(): Observable<{[key: string]: {[key: string]: string}}> {
        return of({}).pipe(
            map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}sparql` })),
            tap(data => console.log('======= Got Res', data)),
            switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
            tap(data => console.log('======= Got Res 2', data)),
            switchMap(data => this.http.post<DGTSparqlResult>(data.uri, {query: this.extraHoldersInfoQuery} , { Authorization: `Bearer ${data.accessToken}`}).pipe(
                tap(response => this.logger.debug(DGTHolderRemoteService.name, 'Got Response', response)),
                map(response => ({ ...data, response})),
            )),
            map(data => null),
        );
    }
    private extraHoldersInfoQuery = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX vcard: <http://www.w3.org/2006/vcard/ns#> select distinct ?name ?bday where { <https://stijntaelemans.inrupt.net/profile/card#me> foaf:name ?name . OPTIONAL { <https://stijntaelemans.inrupt.net/profile/card#me> vcard:fn ?name } . <https://stijntaelemans.inrupt.net/profile/card#me> vcard:bday ?bday }';
}
