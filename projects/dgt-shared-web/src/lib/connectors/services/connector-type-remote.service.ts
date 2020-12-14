import { DGTConfigurationService, DGTHttpService, DGTInjectable, DGTLoggerService, DGTErrorNotImplemented, DGTConfigurationBaseWeb } from '@digita-ai/dgt-shared-utils';
import { DGTConnectorType, DGTConnectorTypeService, DGTLDFilter, DGTLDFilterService, DGTSource } from '@digita-ai/dgt-shared-data';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';

@DGTInjectable()
export class DGTConnectorTypeRemoteService implements DGTConnectorTypeService {

  constructor(
    public store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
    private http: DGTHttpService,
    private logger: DGTLoggerService,
    private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
    private filters: DGTLDFilterService,
  ) { }

  get(id: string): Observable<DGTConnectorType> {
    throw new DGTErrorNotImplemented();
  }
  query(filter?: DGTLDFilter): Observable<DGTConnectorType[]> {
    this.logger.debug(DGTConnectorTypeRemoteService.name, 'Getting all connector types from backend');
    return of({filter}).pipe(
      map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}connector-type/` })),
      switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
      switchMap(data => this.http.get<DGTConnectorType[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` }).pipe(
          map(response => ({ ...data, response })),
      )),
      switchMap(data => data.filter ? this.filters.run<DGTConnectorType>(data.filter, data.response.data) : of(data.response.data)),
    );
  }
  save<T extends DGTConnectorType>(resources: T[]): Observable<T[]> {
    throw new DGTErrorNotImplemented();
  }
  delete(resource: DGTConnectorType): Observable<DGTConnectorType> {
    throw new DGTErrorNotImplemented();
  }
}
