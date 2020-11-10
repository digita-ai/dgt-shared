import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTUriFactoryService } from './dgt-uri-factory.service';

/**
 * Service that generates URIs for resources from a solid pod
 * e.g. https://sanderclaes.inrupt.net/foo/bar
 * Pass resourceType to constructor ('holder', 'connection', 'exchange', ...)
 */
export class DGTUriFactorySolidService implements DGTUriFactoryService {

    /**
     * Generates a URI for a resource
     * @param resource The DGTLDResource to generate a uri for
     */
    public generate(resource: DGTLDResource): string {
        // not sure if this is correct in all cases
        return resource.triples[0].subject.value;
    }

}
