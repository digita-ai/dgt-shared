import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';

@DGTInjectable()
export abstract class DGTCacheService {
    public abstract get<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, uri: string): Observable<T>;
    public abstract query<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, filter?: DGTLDFilter): Observable<T[]>;
    public abstract querySparql(query: string): Observable<string>;
    public abstract delete<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, objects: T[]): Observable<T[]>;
    public abstract save<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, objects: T[]): Observable<T[]>;
}
