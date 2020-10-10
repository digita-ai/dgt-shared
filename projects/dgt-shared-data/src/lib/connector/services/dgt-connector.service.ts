import * as _ from 'lodash';
import { DGTMap, DGTLoggerService, DGTInjectable, DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { DGTSourceType } from '../../source/models/dgt-source-type.model';
import { Observable } from 'rxjs';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { map, mergeMap, mergeAll } from 'rxjs/operators';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTConnector } from '../models/dgt-connector.model';

@DGTInjectable()
export class DGTConnectorService {

  private connectors: DGTMap<DGTSourceType, DGTConnector<any, any>>;

  constructor(
    private logger: DGTLoggerService,
    private sources: DGTSourceService,
    private connections: DGTConnectionService,
  ) { }

  public register(sourceType: DGTSourceType, connector: DGTConnector<any, any>) {
    if (!sourceType) {
      throw new DGTErrorArgument('Argument sourceType should be set.', sourceType);
    }

    if (!connector) {
      throw new DGTErrorArgument('Argument connector should be set.', connector);
    }

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

  public save(exchange: DGTExchange, triple: DGTLDTriple): Observable<DGTLDTriple> {
    if (!exchange) {
      throw new DGTErrorArgument('Argument exchange should be set.', exchange);
    }

    if (!triple) {
      throw new DGTErrorArgument('Argument triple should be set.', triple);
    }

    return this.sources.get(exchange.source).pipe(
      map(source => ({ source, connector: this.connectors.get(source.type) })),
      mergeMap(data => this.connections.get(exchange.connection).pipe(
        map(connection => ({ ...data, connection })),
      )),
      map(data => ({ ...data, triple: { ...triple, documentUri: null, triples: [triple] } })),
      // transformer ??
      // resource ??
      // TEMP, THIS FUNCTION ISNT TESTED YET, LOOK feature/544645000-upstream-connectors
      mergeMap(data => data.connector.upstreamSync([data.triple], data.connection, data.source, null)),
      mergeAll(),
    );
  }

  public query(
    exchange: DGTExchange,
    connection: DGTConnection<any>,
    source: DGTSource<any>,
    purpose: DGTPurpose,
  ): Observable<DGTLDTriple[]> {
    this.logger.debug(DGTConnectorService.name, 'Getting triples', { exchange, connection, source, purpose });

    if (!exchange) {
      throw new DGTErrorArgument('Argument exchange should be set.', exchange);
    }

    if (!connection) {
      throw new DGTErrorArgument('Argument connection should be set.', connection);
    }

    if (!source) {
      throw new DGTErrorArgument('Argument source should be set.', source);
    }

    if (!purpose) {
      throw new DGTErrorArgument('Argument purpose should be set.', purpose);
    }

    const connector: DGTConnector<any, any> = this.get(source.type);

    return connector.query(null, purpose, exchange, connection, source, null)
      .pipe(
        map((entities) => entities.map(entity => entity.triples)),
        map((triples) => _.flatten(triples)),
        map(triples => triples.filter(triple => purpose.predicates.includes(triple.predicate)))
      );
  }
}
