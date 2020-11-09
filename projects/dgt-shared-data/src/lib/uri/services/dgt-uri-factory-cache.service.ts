import { DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTConfigurationBase, DGTConfigurationService, DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { v4 } from 'uuid';
import { DGTUriFactoryService } from './dgt-uri-factory.service';

/**
 * Service that generates URIs for resources in the cache
 * e.g. https://domain.of.our.cache/holder/1234-5678-9012-3456/sanderclaes.inrupt.net/foo/bar
 * pass resourceType to constructor ('holder', 'connection', 'exchange', ...)
 */
export class DGTUriFactoryCacheService implements DGTUriFactoryService {

    constructor(
        private resourceType: string,
        private config: DGTConfigurationService<DGTConfigurationService>,
    ) {}

    /**
     * Generates a URI for a resource
     */
    generate(resource: DGTLDResource): Observable<string> {
        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set', resource);
        }

        return of(`${this.config.get(conf => conf.)}holder#${v4()}`);
    }

}
