import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTUriFactoryService } from './dgt-uri-factory.service';
import { v4 } from 'uuid';
/**
 * Service that generates URIs for resources from a solid pod
 * e.g. https://sanderclaes.inrupt.net/foo/bar
 * Pass resourceType to constructor ('holder', 'connection', 'exchange', ...)
 */
@DGTInjectable()
export class DGTUriFactorySolidService implements DGTUriFactoryService {

    /**
     * Generates a URI for a resource
     * @param resource The DGTLDResource to generate a uri for
     */
    public generate(resource: DGTLDResource, prefix: string): string {
        let res = resource.uri;

        if(!res) {
            res = v4();
        }

        return res;
    }

}
