import { DGTConfigurationBaseApi, DGTConfigurationService } from '@digita-ai/dgt-shared-utils';
import { v4 } from 'uuid';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTUriFactoryService } from './dgt-uri-factory.service';

/**
 * Service that generates URIs for resources in the cache
 * e.g. https://domain.of.our.cache/holder#1234-5678-9012-3456
 * pass resourceType to constructor ('holder', 'connection', 'exchange', ...)
 */
export class DGTUriFactoryCacheService implements DGTUriFactoryService {

    constructor(
        private config: DGTConfigurationService<DGTConfigurationBaseApi>,
    ) {}

    /**
     * Generates a URI for a resource
     */
    generate(resource: DGTLDResource, prefix: string): string {
        return `${this.config.get(conf => conf.cache.uri)}${prefix}#${v4()}`;
    }

}
