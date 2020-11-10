import { DGTLDResource, DGTLDTriple } from '@digita-ai/dgt-shared-data';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';

@DGTInjectable()
export abstract class DGTUriFactoryService {

    public abstract generate(resource: DGTLDResource | DGTLDTriple): Observable<string>;
}
