import { Observable, of } from 'rxjs';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { DGTConnectionService } from './dgt-connection-abstract.service';
import { DGTConnection } from '../models/dgt-connection.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { switchMap } from 'rxjs/operators';
import { DGTConnectionSolid } from '../models/dgt-connection-solid.model';

@DGTInjectable()
export class DGTConnectionMockService extends DGTConnectionService {
  public resources = [];

  constructor(
    private logger: DGTLoggerService, private filters: DGTLDFilterService
  ) {
    super();
  }

  public create(connection: DGTConnection<any>): Observable<DGTConnection<any>> {
    if (!connection) {
      throw new DGTErrorArgument('Argument connection should be set.', connection);
    }
    if (connection.uri && connection.holder && connection.configuration && connection.source) {
      this.resources.push(connection);
    } else if (connection.holder && connection.configuration && connection.source) {
      // create new connection with generated uri
      const connectionUri = uuid();
      connection.uri = connectionUri;
      this.resources.push(connection);
    } else {
      throw new DGTErrorArgument('Argument connection should be set correctly.', connection);
    }

    return of(connection);
  }

  public get(uri: string): Observable<DGTConnection<any>> {
    this.logger.debug(DGTConnectionMockService.name, 'Starting to get connection', { uri });

    return of(this.resources.find(e => e.uri === uri));
  }

  public query(filter?: DGTLDFilter): Observable<Array<DGTConnection<any>>> {
    this.logger.debug(DGTConnectionMockService.name, 'Starting to query connections', filter);

    return of({ filter, resources: this.resources })
      .pipe(
        switchMap(data => data.filter ? this.filters.run<DGTConnection<any>>(data.filter, data.resources) : of(data.resources)),
      )
  }

  public save(resource: DGTConnection<any>): Observable<DGTConnection<any>> {
    this.logger.debug(DGTConnectionMockService.name, 'Starting to save resource', { resource });

    if (!resource) {
      throw new DGTErrorArgument('Argument connection should be set.', resource);
    }

    if (!resource.uri) {
      this.resources = [...this.resources, resource];
    } else {
      this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri), resource];
    }

    return of(resource);
  }

  public delete(resource: DGTConnection<any>): Observable<DGTConnection<any>> {
    this.logger.debug(DGTConnectionMockService.name, 'Starting to delete resource', { resource });

    if (!resource) {
      throw new DGTErrorArgument('Argument resource should be set.', resource);
    }

    this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri)];

    return of(resource);
  }

  public getConnectionsWithWebId(webId: string): Observable<DGTConnectionSolid[]> {
    if (!webId) {
      throw new DGTErrorArgument('Argument webId should be set.', webId);
    }

    return of(this.resources.filter(connection => connection.configuration && connection.configuration.webId === webId));
  }

  public getConnectionForInvite(inviteId: string, sourceId: string): Observable<any> {
    throw new DGTErrorNotImplemented();
  }

  public sendTokensForInvite(inviteId: string, fragvalue: string): Observable<DGTConnection<any>> {
    throw new DGTErrorNotImplemented();
  }
}
