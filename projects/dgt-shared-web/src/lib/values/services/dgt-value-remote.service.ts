import { DGTDataValue, DGTDataValueService, DGTHolder, DGTLDFilterService, DGTConfigurationBaseWeb, DGTDataValueTransformerService, DGTLDFilter } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationService, DGTErrorArgument, DGTHttpService, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from "@digita-ai/dgt-shared-utils";
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import * as _ from 'lodash';
@DGTInjectable()
export class DGTValueRemoteService extends DGTDataValueService {
    constructor(
        private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
        private http: DGTHttpService,
        logger: DGTLoggerService,
        private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
        private transformer: DGTDataValueTransformerService,
        paramChecker: DGTParameterCheckerService,
        filters: DGTLDFilterService
    ) {
        super(logger, paramChecker, filters);
    }

    get(uri: string): Observable<DGTDataValue> {
        this.logger.debug(DGTValueRemoteService.name, 'Starting to get', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri })
            .pipe(
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}value/${data.uri}` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTDataValue>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                switchMap(response => this.transformer.toDomain([response.data])),
                map(values => _.head(values)),
            );
    }
    query(filter?: DGTLDFilter): Observable<DGTDataValue[]> {
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
                map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}holder/${data.holder.uri}/resources` })),
                switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
                switchMap(data => this.http.get<DGTDataValue[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
                switchMap(response => this.transformer.toDomain(response.data)),
            );
    }
}