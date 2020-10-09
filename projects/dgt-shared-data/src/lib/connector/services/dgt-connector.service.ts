import * as _ from 'lodash';
import { DGTMap, DGTLoggerService, DGTParameterCheckerService, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTSourceConnector } from '../../source/models/dgt-source-connector.model';
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
import { DGTPurposeService } from '../../purpose/services/dgt-purpose.service';

@DGTInjectable()
export class DGTConnectorService {

  private connectors: DGTMap<DGTSourceType, DGTSourceConnector<any, any>>;

  constructor(
    private logger: DGTLoggerService,
    private sources: DGTSourceService,
    private connections: DGTConnectionService,
    private paramChecker: DGTParameterCheckerService,
    private purposes: DGTPurposeService,
  ) { }

  public register(sourceType: DGTSourceType, connector: DGTSourceConnector<any, any>) {
    if (!this.connectors) {
      this.connectors = new DGTMap<DGTSourceType, DGTSourceConnector<any, any>>();
    }

    this.connectors.set(sourceType, connector);
  }

  public get(sourceType: DGTSourceType) {
    return this.connectors.get(sourceType);
  }

  public save(exchange: DGTExchange, triple: DGTLDTriple, destination: string): Observable<DGTLDTriple> {
    this.logger.debug(DGTConnectorService.name, 'preparing upstream sync', {exchange, triple, destination});

    return this.connections.get(destination).pipe(
      map( connection => ({ connection })),
      mergeMap( data => this.sources.get(data.connection.source).pipe(
        map( source => ({ ...data, source })),
      )),
      map( data => ({ ...data, connector: this.connectors.get(data.source.type) })),
      map( data => ({ ...data, triple: { ...triple, documentUri: null, triples: [triple]}})),
      mergeMap( data => this.purposes.get(exchange.purpose).pipe(
        map( purpose => ({ ... data, purpose })),
      )),
      mergeMap( data => data.connector.upstreamSync(data.triple, data.connection, data.source, null, data.purpose, exchange) ),
      mergeAll(),
    );
  }

  public getTriples(
    exchange: DGTExchange,
    connection: DGTConnection<any>,
    source: DGTSource<any>,
    purpose: DGTPurpose,
  ): Observable<DGTLDTriple[]> {
    this.logger.debug(DGTConnectorService.name, 'Getting triples', {exchange, connection, source, purpose});

    this.paramChecker.checkParametersNotNull({exchange, connection, source, purpose});

    const connector: DGTSourceConnector<any, any> = this.get(source.type);

    return connector.query(null, purpose, exchange, connection, source, null)
      .pipe(
        map((entities) => entities.map(entity => entity.triples)),
        map((triples) => _.flatten(triples)),
        map(triples => triples.filter(triple => purpose.predicates.includes(triple.predicate)))
      );
  }
}