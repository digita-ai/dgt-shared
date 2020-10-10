import { Observable } from 'rxjs';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTSource } from '../../source/models/dgt-source.model';

@DGTInjectable()
export abstract class DGTConnector<T, S> {
    public abstract add<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract connect(purpose: DGTPurpose, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>): Observable<DGTConnection<S>>;
    public abstract query<R extends DGTLDResource>(holderUri: string, purpose: DGTPurpose, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract delete<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract update<R extends DGTLDResource>(domainEntities: { original: R, updated: R }[], connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract upstreamSync<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>;
}
