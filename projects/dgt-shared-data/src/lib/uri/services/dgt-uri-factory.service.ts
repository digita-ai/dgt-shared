import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

@DGTInjectable()
export abstract class DGTUriFactoryService {
    public abstract generate(resources: DGTLDResource[], prefix: string): Observable<DGTLDResource[]>;
}
