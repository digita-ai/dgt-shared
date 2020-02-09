import { DGTLDResponse } from '../../linked-data/models/dgt-ld-response.model';
import { DGTSource } from './dgt-source.model';
import { DGTExchange } from '../../subject/models/dgt-subject-exchange.model';
import { Observable } from 'rxjs';
import { DGTProvider } from '../../provider/models/dgt-provider.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';

export interface DGTSourceConnector<T, S> {
    connect(justification: DGTJustification, exchange: DGTExchange, provider: DGTProvider<S>, source: DGTSource<T>): Observable<DGTProvider<S>>;
    query(justification: DGTJustification, exchange: DGTExchange, provider: DGTProvider<S>, source: DGTSource<T>): Observable<DGTLDResponse>;
}
