import { DGTDataValue, DGTDataValueService, DGTHolder, DGTLDFilterService, DGTConfigurationBaseWeb } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationService, DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from "@digita-ai/dgt-shared-utils";
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTValueRemoteService extends DGTDataValueService {
    constructor(
        private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
        private http: DGTHttpService,
        logger: DGTLoggerService,
        private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
        paramChecker: DGTParameterCheckerService,
        filters: DGTLDFilterService
    ) {
        super(logger, paramChecker, filters);
    }

    get(id: string): Observable<DGTDataValue> {
        this.logger.debug(DGTValueRemoteService.name, 'Starting to get', { id });

        if (!id) {
            throw new DGTErrorArgument('Argument id should be set.', id);
        }

        return of({ id })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}value/${data.id}` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTDataValue>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }
    query(filter: Partial<DGTDataValue>): Observable<DGTDataValue[]> {
        throw new Error('Method not implemented.');
    }
    save(resource: DGTDataValue): Observable<DGTDataValue> {
        throw new Error('Method not implemented.');
    }
    delete(resource: DGTDataValue): Observable<DGTDataValue> {
        throw new Error('Method not implemented.');
    }
    getForHolder(holder: DGTHolder): Observable<DGTDataValue[]> {
        this.logger.debug(DGTValueRemoteService.name, 'Starting to get', { holder });

        if (!holder) {
            throw new DGTErrorArgument('Argument holder should be set.', holder);
        }

        return of({ holder })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}holder/${data.holder.id}/values` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTDataValue[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                map(response => response.data),
            );
    }
}