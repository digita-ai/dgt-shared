import { DGTLDFilter, DGTLDFilterService, DGTWorkflow, DGTWorkflowService } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationBaseWeb, DGTConfigurationService, DGTErrorArgument, DGTErrorNotImplemented, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';

@DGTInjectable()
export class DGTWorkflowRemoteService extends DGTWorkflowService {

  constructor(
    public store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
    private http: DGTHttpService,
    private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
    private logger: DGTLoggerService,
    private filters: DGTLDFilterService,
  ) {
    super();
  }

  public save<T extends DGTWorkflow>(workflows: T[]): Observable<T[]> {
    this.logger.debug(DGTWorkflowRemoteService.name, 'Starting to save', { workflows });

    if (!workflows) {
      throw new DGTErrorArgument('Argument workflows should be set.', workflows);
    }

    return of({ workflows })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}workflow` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => forkJoin(workflows.map(workflow => this.http.post<T>(data.uri, workflow, { Authorization: `Bearer ${data.accessToken}` })
          .pipe(map(response => response.data))))),
      );
  }

  public get<T extends DGTWorkflow>(uri: string): Observable<T> {
    this.logger.debug(DGTWorkflowRemoteService.name, 'Starting to get', { uri });

    if (!uri) {
      throw new DGTErrorArgument('Argument uri should be set.', uri);
    }

    return of({ uri })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}workflow/${encodeURIComponent(data.uri)}` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => this.http.get<T>(data.uri, { Authorization: `Bearer ${data.accessToken}` })),
        map(response => response.data),
      );
  }

  public delete<T extends DGTWorkflow>(workflow: T): Observable<T> {
    throw new DGTErrorNotImplemented();
  }

  public query<T extends DGTWorkflow>(filter?: DGTLDFilter): Observable<T[]> {
    this.logger.debug(DGTWorkflowRemoteService.name, 'Starting to query', { filter });

    return of({ filter })
      .pipe(
        map(data => ({ ...data, uri: `${this.config.get(c => c.server.uri)}workflow` })),
        switchMap(data => this.store.select(state => state.app.accessToken).pipe(map(accessToken => ({ ...data, accessToken })))),
        switchMap(data => this.http.get<T[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` })
          .pipe(map(response => ({ ...data, response })))),
        switchMap(data => data.filter ? this.filters.run<T>(data.filter, data.response.data) : of(data.response.data)),
      );
  }
}
