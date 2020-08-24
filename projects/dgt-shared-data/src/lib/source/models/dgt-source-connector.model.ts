import { DGTSource } from './dgt-source.model';
import { Observable } from 'rxjs';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';

export interface DGTSourceConnector<T, S> {
    connect(justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>): Observable<DGTConnection<S>>;
    query<R extends DGTLDResource>(holderUri: string, justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>
}
