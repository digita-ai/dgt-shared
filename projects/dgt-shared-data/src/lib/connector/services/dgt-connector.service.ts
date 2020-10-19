import * as _ from 'lodash';
import { DGTParameterCheckerService, DGTMap, DGTLoggerService, DGTInjectable, DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { DGTSourceType } from '../../source/models/dgt-source-type.model';
import { Observable, forkJoin } from 'rxjs';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { map, mergeMap, tap, catchError } from 'rxjs/operators';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTPurposeService } from '../../purpose/services/dgt-purpose.service';
import { DGTConnector } from '../models/dgt-connector.model';
import { DGTDataValueTransformerService } from '../../data-value/services/data-transformer-value.service';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

@DGTInjectable()
export class DGTConnectorService {

  private connectors: DGTMap<DGTSourceType, DGTConnector<any, any>>;

  constructor(
    private logger: DGTLoggerService,
    private sources: DGTSourceService,
    private connections: DGTConnectionService,
    private paramChecker: DGTParameterCheckerService,
    private purposes: DGTPurposeService,
    private dataValueTransformer: DGTDataValueTransformerService,
  ) { }

  public register(sourceType: DGTSourceType, connector: DGTConnector<any, any>) {
    this.paramChecker.checkParametersNotNull({ sourceType, connector });

    if (!this.connectors) {
      this.connectors = new DGTMap<DGTSourceType, DGTConnector<any, any>>();
    }

    this.connectors.set(sourceType, connector);
  }

  public get(sourceType: DGTSourceType) {
    if (!sourceType) {
      throw new DGTErrorArgument('Argument sourceType should be set.', sourceType);
    }

    return this.connectors.get(sourceType);
  }

  public save(exchange: DGTExchange, triples: DGTLDTriple[], destination: string): Observable<DGTLDTriple[]> {
    this.paramChecker.checkParametersNotNull({ exchange, triples });

    return this.sources.get(destination).pipe(
      map(source => ({ source })),
      // get connection
      mergeMap(data => this.connections.query({ holder: exchange.holder, source: data.source.id }).pipe(
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
      mergeMap(data => forkJoin(triples.map(triple =>
        data.connector.upstreamSync(
          {
            ...triple,
            connection: exchange.connection,
            source: exchange.source,
            subject: null,
            documentUri: null,
            triples: [triple],
          } as DGTLDResource, data.connection, data.source, null, data.purpose, exchange)
      )).pipe(map(resultFromUpstream => ({ ...data, resultFromUpstream })))),
      map(data => _.flatten(data.resultFromUpstream.map(res => res.triples))),
      // catch error if no connection found
      catchError(() => {
        this.logger.debug(DGTConnectorService.name, 'No connection was found for this upstreamSync');
        return [triples];
      }),
    );
  }

  public query(
    exchange: DGTExchange,
    connection: DGTConnection<any>,
    source: DGTSource<any>,
    purpose: DGTPurpose,
  ): Observable<DGTLDTriple[]> {
    this.logger.debug(DGTConnectorService.name, 'Getting triples', { exchange, connection, source, purpose });

    this.paramChecker.checkParametersNotNull({ exchange, connection, source, purpose });

    const connector: DGTConnector<any, any> = this.get(source.type);

    return connector.query(null, purpose, exchange, connection, source, null)
      .pipe(
        map((entities) => entities.map(entity => entity.triples)),
        map((triples) => _.flatten(triples)),
        map(triples => triples.filter(triple => purpose.predicates.includes(triple.predicate))),
      );
  }
}
