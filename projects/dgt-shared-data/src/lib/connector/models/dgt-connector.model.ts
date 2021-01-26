import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';
import { DGTSource } from '../../source/models/dgt-source.model';

@DGTInjectable()
export abstract class DGTConnector<T, S> {
    public abstract save<R extends DGTLDResource>(domainEntities: R[], transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract connect(purpose: DGTPurpose, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>): Observable<DGTConnection<S>>;
    public abstract query<R extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract delete<R extends DGTLDResource>(domainEntities: R[], transformer: DGTLDTransformer<R>): Observable<R[]>;
}
