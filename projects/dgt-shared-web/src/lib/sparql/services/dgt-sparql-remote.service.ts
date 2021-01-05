import { DGTSparqlOptionsRemote, DGTSparqlResult, DGTSparqlService } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';

@DGTInjectable()
export class DGTSparqlRemoteService extends DGTSparqlService<DGTSparqlOptionsRemote> {
    constructor(private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>, private http: DGTHttpService, private logger: DGTLoggerService) {
        super();
    }

    public query(query: string, options: DGTSparqlOptionsRemote): Observable<DGTSparqlResult> {
        this.logger.debug(DGTSparqlRemoteService.name, 'Starting to execute query', { query, options });

        if (!query) {
            throw new DGTErrorArgument('Argument query should be set.', query);
        }

        if (!options) {
            throw new DGTErrorArgument('Argument options should be set.', options);
        }

        return of({ query, options })
            .pipe(
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.post<any>(data.options.uri, { query: data.query }, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }
}
