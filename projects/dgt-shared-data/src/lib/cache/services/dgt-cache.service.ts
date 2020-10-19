import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import * as _ from 'lodash';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTQuery } from '../../metadata/models/dgt-query.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTConnectionSolidConfiguration } from '../../connection/models/dgt-connection-solid-configuration.model';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTSourceSolidConfiguration } from '../../source/models/dgt-source-solid-configuration.model';

@DGTInjectable()
export abstract class DGTCacheService {
    public cache: DGTLDTriple[];
    public abstract remove(query: DGTQuery): Observable<any>
    public abstract query<T>(filter: DGTLDFilter, transformer: DGTLDTransformer<T>): Observable<any>
    public abstract delete<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<DGTConnectionSolidConfiguration>, source: DGTSource<DGTSourceSolidConfiguration>, transformer: DGTLDTransformer<R>): Observable<R[]>
    
    //TODO check if we can remove the connection
    public abstract save<T>(transformer: DGTLDTransformer<T>, toBeSaved: T[], connection: DGTConnection<any>): Observable<DGTLDTriple[] | T[]>

}
