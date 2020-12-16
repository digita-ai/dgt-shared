import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTMap, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTLDFilterPartial } from '../../linked-data/models/dgt-ld-filter-partial.model';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTPurposeService } from '../../purpose/services/dgt-purpose.service';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { DGTConnector } from '../models/dgt-connector.model';

@DGTInjectable()
export class DGTConnectorService {

  private connectors: DGTMap<string, DGTConnector<any, any>>;

  constructor(
    private logger: DGTLoggerService,
    private sources: DGTSourceService,
    private connections: DGTConnectionService,
    private paramChecker: DGTParameterCheckerService,
    private purposes: DGTPurposeService,
  ) { }

  public register(sourceType: string, connector: DGTConnector<any, any>) {
    this.paramChecker.checkParametersNotNull({ sourceType, connector });

    if (!this.connectors) {
      this.connectors = new DGTMap<string, DGTConnector<any, any>>();
    }

    this.connectors.set(sourceType, connector);
  }

  public get(sourceType: string) {
    if (!sourceType) {
      throw new DGTErrorArgument('Argument sourceType should be set.', sourceType);
    }

    return this.connectors.get(sourceType);
  }

  public save<T extends DGTLDResource>(exchange: DGTExchange, resources: T[], destination: string): Observable<T[]> {
    this.paramChecker.checkParametersNotNull({ exchange, triples: resources });

    return this.sources.get(destination).pipe(
      map(source => ({ source })),
      // get connection
      mergeMap(data => this.connections.query({
        type: DGTLDFilterType.PARTIAL,
        partial: { holder: exchange.holder, source: data.source.uri },
      } as DGTLDFilterPartial)
        .pipe(
          tap(connection => this.logger.debug(DGTConnectorService.name, 'found connection for upstream', connection)),
          map(connection => connection.length > 0 ? connection : [null]),
          map(connection => ({ ...data, connection: connection[0] })),
        )),
      // check if connection is set
      map(data => {
        if (data.connection !== null) {
          return data;
        } else {
          throw new DGTErrorArgument('No connection found for this upstreamSync', data.connection);
        }
      }),
      // get connector
      map(data => ({ ...data, connector: this.connectors.get(data.source.type) })),
      // get purpose
      mergeMap(data => this.purposes.get(exchange.purpose).pipe(
        map(purpose => ({ ...data, purpose })),
      )),
      mergeMap(data => {
        if (resources.length === 0) {
          throw new DGTErrorArgument('triples can not be an empty list', resources);
        }
        return forkJoin(resources.map(resource => this.upstreamSync(
          data.connector, resource, data.connection, null, exchange),
        )).pipe(map(resultFromUpstream => ({ ...data, resultFromUpstream })));
      }),
      map(data => _.flatten(data.resultFromUpstream)),
      // catch error if no connection found or triples was an empty list
      catchError(() => {
        this.logger.debug(DGTConnectorService.name, 'No connection was found for this upstreamSync');
        return [resources];
      }),
    );
  }

  public upstreamSync<T extends DGTLDResource>(
    connector: DGTConnector<any, any>,
    domainEntity: T,
    connection: DGTConnection<any>,
    transformer: DGTLDTransformer<T>,
    exchange: DGTExchange,
  ): Observable<T> {
    this.logger.debug(DGTConnectorService.name, 'upstream syncing',
      { connector, domainEntity, connection, transformer, exchange });

    domainEntity.uri = connection.configuration.webId;
    // find possible existing values
    return connector.query(domainEntity.uri, exchange, transformer).pipe(
      switchMap(existingValues => {
        if (existingValues[0]) {
          // convert to list of {original: Object, updated: Object}
          const updateDomainEntity = { original: existingValues[0], updated: domainEntity };
          this.logger.debug(DGTConnectorService.name, 'Updating value', { connector, updateDomainEntity });
          return connector.update([updateDomainEntity], transformer).pipe(
            map(triples => triples[0]),
            catchError(() => {
              this.logger.debug(DGTConnectorService.name, '[upstreamSync] error updating', { connector, updateDomainEntity });
              return of(domainEntity);
            }),
          );
        } else {
          this.logger.debug(DGTConnectorService.name, 'adding value', { connector, domainEntity });
          return connector.add([domainEntity], transformer).pipe(
            map(triples => triples[0]),
            catchError(() => {
              this.logger.debug(DGTConnectorService.name, '[upstreamSync] error adding', { connector, domainEntity });
              return of(domainEntity);
            }),
          );
        }
      }),
    );
  }

  public query<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
    this.logger.debug(DGTConnectorService.name, 'Getting triples', { exchange });

    this.paramChecker.checkParametersNotNull({ exchange });

    return of({ exchange })
      .pipe(
        switchMap((data) => this.sources.get(data.exchange.source)
          .pipe(map(source => ({ source, ...data, connector: this.get(source.type) })))),
        switchMap(data => data.connector.query<T>(null, exchange, transformer)
          .pipe(map(resources => ({ ...data, resources })))),
        // map(resources => triples.filter(triple => purpose.predicates.includes(triple.predicate))),
        tap(data => this.logger.debug(DGTConnectorService.name, 'Queried resources for exchange', data)),
        map(data => data.resources),
        // catchError(() => of([])),
      );
  }
}
