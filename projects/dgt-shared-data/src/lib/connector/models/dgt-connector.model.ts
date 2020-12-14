import { Observable } from 'rxjs';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTSource } from '../../source/models/dgt-source.model';

@DGTInjectable()
export abstract class DGTConnector<T, S> {
    public abstract add<R extends DGTLDResource>(domainEntities: R[], transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract query<R extends DGTLDResource>(holderUri: string, exchange: DGTExchange, transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract delete<R extends DGTLDResource>(domainEntities: R[], transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract update<R extends DGTLDResource>(domainEntities: { original: R, updated: R }[], transformer: DGTLDTransformer<R>): Observable<R[]>;
}
