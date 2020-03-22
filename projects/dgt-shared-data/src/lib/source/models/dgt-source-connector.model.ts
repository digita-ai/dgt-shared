import { DGTLDResponse } from '../../linked-data/models/dgt-ld-response.model';
import { DGTSource } from './dgt-source.model';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { Observable } from 'rxjs';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';

export interface DGTSourceConnector<T, S> {
    connect(justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>): Observable<DGTConnection<S>>;
    query(justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>): Observable<DGTLDResponse>;
}
