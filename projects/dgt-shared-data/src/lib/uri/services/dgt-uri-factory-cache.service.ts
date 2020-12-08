import { DGTConfigurationService, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { v4 } from 'uuid';
import { DGTConfigurationBaseApi } from '../../configuration/models/dgt-configuration-base-api.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTUriFactoryService } from './dgt-uri-factory.service';

/**
 * Service that generates URIs for resources in the cache
 * e.g. https://domain.of.our.cache/holder#1234-5678-9012-3456
 * pass resourceType to constructor ('holder', 'connection', 'exchange', ...)
 */
@DGTInjectable()
export class DGTUriFactoryCacheService implements DGTUriFactoryService {

    constructor(
        private config: DGTConfigurationService<DGTConfigurationBaseApi>,
    ) { }

    /**
     * Generates a URI for a resource
     */
    generate(resource: DGTLDResource, prefix: string): string {
        let uri = `${this.config.get(conf => conf.cache.uri)}${prefix}#${v4()}`;

        if (resource && resource.exchange) {
            uri = `${this.config.get(conf => conf.cache.uri)}${prefix}/${encodeURIComponent(resource.exchange)}`;
        }

        return uri;
    }

}
