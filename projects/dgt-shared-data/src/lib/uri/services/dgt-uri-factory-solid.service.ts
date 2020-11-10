import { DGTLDTriple } from '@digita-ai/dgt-shared-data/public-api';
import { Observable, of } from 'rxjs';
import { DGTUriFactoryService } from './dgt-uri-factory.service';

/**
 * Service that generates URIs for resources from a solid pod
 * e.g. https://sanderclaes.inrupt.net/foo/bar
 * pass resourceType to constructor ('holder', 'connection', 'exchange', ...)
 */
export class DGTUriFactorySolidService implements DGTUriFactoryService {

    constructor() {}

    /**
     * Generates a URI for a resource
     */
    public generate(triple: DGTLDTriple): Observable<string> {
        return of(triple.subject.value);
    }

}
