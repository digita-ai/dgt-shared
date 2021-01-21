import { DGTConfigurationBaseApi, DGTConfigurationService, DGTErrorArgument, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { v4 } from 'uuid';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTUriFactoryService } from './dgt-uri-factory.service';

/**
 * Service that generates URIs for resources in the cache
 * e.g. https://domain.of.our.cache/holder#1234-5678-9012-3456
 * pass resourceType to constructor ('holder', 'connection', 'exchange', ...)
 */
@DGTInjectable()
export class DGTUriFactoryCacheService implements DGTUriFactoryService {
    constructor(private config: DGTConfigurationService<DGTConfigurationBaseApi>) {}

    /**
     * Generates a URI for a resource
     */
    public generate(resources: DGTLDResource[], prefix: string): Observable<DGTLDResource[]> {
        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        if (!prefix) {
            throw new DGTErrorArgument('Argument prefix should be set.', prefix);
        }

        return of(resources.map((resource) => ({ ...resource, uri: this.generateOne(resource, prefix) })));
    }

    private generateOne(resource: DGTLDResource, prefix: string): string {
        let uri = `${this.config.get((conf) => conf.cache.uri)}${prefix}/${v4()}`;

        if (resource && resource.exchange) {
            uri = `${this.config.get((conf) => conf.cache.uri)}${prefix}/${encodeURIComponent(resource.exchange)}`;
        }

        return uri;
    }
}
