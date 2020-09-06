import { DGTSource } from './dgt-source.model';
import { Observable } from 'rxjs';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTJustification } from '../../justification/models/dgt-justification.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class DGTSourceConnector<T, S> {
    public abstract add<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract connect(justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>): Observable<DGTConnection<S>>;
    public abstract query<R extends DGTLDResource>(holderUri: string, justification: DGTJustification, exchange: DGTExchange, connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract delete<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>;
    public abstract update<R extends DGTLDResource>(domainEntities: { original: R, updated: R }[], connection: DGTConnection<S>, source: DGTSource<T>, transformer: DGTLDTransformer<R>): Observable<R[]>;
}
