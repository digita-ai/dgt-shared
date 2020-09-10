import { DGTSource } from '../models/dgt-source.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DGTLoggerService, DGTMap } from '@digita/dgt-shared-utils';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Injectable } from '@angular/core';
import { DGTSourceConnector } from '../models/dgt-source-connector.model';
import { DGTSourceType } from '../models/dgt-source-type.model';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import * as _ from 'lodash';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';

@Injectable()
export abstract class DGTSourceService {

    private connectors: DGTMap<DGTSourceType, DGTSourceConnector<any, any>>;

    constructor(protected logger: DGTLoggerService) { }

    public abstract get(sourceId: string): Observable<DGTSource<any>>;
    public abstract all(): Observable<Array<DGTSource<any>>>;
    public abstract update(source: DGTSource<any>): Observable<DGTSource<any>>;
    public abstract linkSource(inviteId: string, sourceId: string): Observable<{ state: string; loginUri: string; }>;

    public query(exchange: DGTExchange, connection: DGTConnection<any>, source: DGTSource<any>, purpose: DGTPurpose)
        : Observable<DGTLDTriple[]> {
        this.logger.debug(DGTSourceService.name, 'Getting source', source);

        let connector: DGTSourceConnector<any, any> = null;

        if (this.connectors) {
            connector = this.connectors.get(source.type);
        }

        return connector.query(null, purpose, exchange, connection, source, null)
            .pipe(
                map((entities) => entities.map(entity => entity.triples)),
                map((triples) => _.flatten(triples)),
            );
    }

    public register(sourceType: DGTSourceType, connector: DGTSourceConnector<any, any>) {
        if (!this.connectors) {
            this.connectors = new DGTMap<DGTSourceType, DGTSourceConnector<any, any>>();
        }

        this.connectors.set(sourceType, connector);
    }
}
