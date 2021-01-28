import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTSecurityPolicy } from '../models/dgt-security-policy.model';
import { DGTSecurityPolicyTransformerService } from './dgt-security-policy-transformer.service';
import { DGTSecurityPolicyService } from './dgt-security-policy.service';

@DGTInjectable()
export class DGTSecurityPolicyCacheService extends DGTSecurityPolicyService {
    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTSecurityPolicyTransformerService,
        private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTSecurityPolicy> {
        this.logger.debug(DGTSecurityPolicyCacheService.name, 'Starting to get policies', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTSecurityPolicy>(this.transformer, uri);
    }

    public query<T extends DGTSecurityPolicy>(filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTSecurityPolicyCacheService.name, 'Starting to query policies', filter);

        return this.cache.query<T>(this.transformer, filter);
    }

    public save<T extends DGTSecurityPolicy>(resources: T[]): Observable<T[]> {
        this.logger.debug(DGTSecurityPolicyCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument policy should be set.', resources);
        }

        return of({
            resources,
        }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'policy')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as T[] }))),
            ),
            switchMap((data) =>
                this.cache.save<T>(this.transformer, data.resources).pipe(map((savedResources) => savedResources)),
            ),
        );
    }

    public delete(resource: DGTSecurityPolicy): Observable<DGTSecurityPolicy> {
        this.logger.debug(DGTSecurityPolicyCacheService.name, 'Starting to delete policy', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ resource }).pipe(
            switchMap((data) =>
                this.cache.delete(this.transformer, [data.resource]).pipe(map((resources) => ({ ...data, resources }))),
            ),
            map((data) => _.head(data.resources)),
        );
    }
}
