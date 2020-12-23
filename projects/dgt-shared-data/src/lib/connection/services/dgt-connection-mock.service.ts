import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTConnection } from '../models/dgt-connection.model';
import { DGTConnectionService } from './dgt-connection-abstract.service';

@DGTInjectable()
export class DGTConnectionMockService extends DGTConnectionService {
  public resources = [];

  constructor(
    private logger: DGTLoggerService, private filters: DGTLDFilterService, private uri: DGTUriFactoryService,
  ) {
    super();
  }

  public create<T extends DGTConnection<any>>(connection: T): Observable<T> {
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

  public get<T extends DGTConnection<any>>(uri: string): Observable<T> {
    this.logger.debug(DGTConnectionMockService.name, 'Starting to get connection', { uri });

    return of(this.resources.find(e => e.uri === uri));
  }

  public query<T extends DGTConnection<any>>(filter?: DGTLDFilter): Observable<T[]> {
    this.logger.debug(DGTConnectionMockService.name, 'Starting to query connections', filter);

    return of({ filter, resources: this.resources })
      .pipe(
        switchMap(data => data.filter ? this.filters.run<DGTConnection<any>>(data.filter, data.resources) : of(data.resources)),
      )
  }

  public save<T extends DGTConnection<any>>(resources: T[]): Observable<T[]> {
    this.logger.debug(DGTConnectionMockService.name, 'Starting to save resources', { resources });

    if (!resources) {
      throw new DGTErrorArgument('Argument connection should be set.', resources);
    }

    return of({ resources })
      .pipe(
        map(data => data.resources.map(resource => {
          if (!resource.uri) {
            resource.uri = this.uri.generate(resource, 'connection');
          }

          this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri), resource];

          return resource;
        }),
        ),
      );
  }

  public delete<T extends DGTConnection<any>>(resource: T): Observable<T> {
    this.logger.debug(DGTConnectionMockService.name, 'Starting to delete resource', { resource });

    if (!resource) {
      throw new DGTErrorArgument('Argument resource should be set.', resource);
    }

    this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri)];

    return of(resource);
  }

  public getConnectionsWithWebId<T extends DGTConnection<any>>(webId: string): Observable<T[]> {
    if (!webId) {
      throw new DGTErrorArgument('Argument webId should be set.', webId);
    }

    return of(this.resources.filter(connection => connection.configuration && connection.configuration.session.info.webId === webId));
  }

  public getConnectionForInvite(inviteId: string, sourceId: string): Observable<any> {
    throw new DGTErrorNotImplemented();
  }

  public sendTokensForInvite<T extends DGTConnection<any>>(inviteId: string, fragvalue: string): Observable<T> {
    throw new DGTErrorNotImplemented();
  }

  public getConnectionBySessionId(sessionId: string): Observable<DGTConnection<any>> {
    throw new Error('Method not implemented.');
  }
}
