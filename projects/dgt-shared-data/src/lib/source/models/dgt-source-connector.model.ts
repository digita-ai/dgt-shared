import { DGTSource } from './dgt-source.model';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { Observable } from 'rxjs';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { DGTLDEntity } from '../../linked-data/models/dgt-ld-entity.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';

export interface DGTSourceConnector<T, S> {
    connect(justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>): Observable<DGTConnection<S>>;
    query<R extends DGTLDEntity>(subjectUri: string, justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>
}
