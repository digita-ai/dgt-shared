import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';

@DGTInjectable()
export abstract class DGTLDRepresentationFactory<T> {
    public abstract serialize<R extends DGTLDResource>(resources: R[], transformer: DGTLDTransformer<R>): Observable<T>;
    public abstract deserialize<R extends DGTLDResource>(serialized: T, transformer: DGTLDTransformer<R>): Observable<R[]>;
}
