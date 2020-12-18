import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTSecurityPolicy } from '../models/dgt-security-policy.model';
import { DGTSecurityPolicyService } from './dgt-security-policy.service';

@DGTInjectable()
export class DGTSecurityPolicyMockService extends DGTSecurityPolicyService {
    private resources: DGTSecurityPolicy[] = [];

    constructor(
        private logger: DGTLoggerService, private filters: DGTLDFilterService, private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTSecurityPolicy> {
        return of(this.resources.find(e => e.uri === uri));
    }

    public query<T extends DGTSecurityPolicy>(filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTSecurityPolicyMockService.name, 'Starting to query policies', filter);

        return of({ filter, resources: this.resources as T[] })
            .pipe(
                switchMap(data => data.filter ? this.filters.run<T>(data.filter, data.resources) : of(data.resources)),
            );
    }

    public save<T extends DGTSecurityPolicy>(resources: T[]): Observable<T[]> {
        this.logger.debug(DGTSecurityPolicyMockService.name, 'Starting to save resources', { resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument policy should be set.', resources);
        }

        return of({ resources })
            .pipe(
                map(data => data.resources.map(resource => {
                    if (!resource.uri) {
                        resource.uri = this.uri.generate(resource, 'policy');
                    }

                    this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri), resource];

                    return resource;
                }),
                ),
            );
    }

    public delete(resource: DGTSecurityPolicy): Observable<DGTSecurityPolicy> {
        this.logger.debug(DGTSecurityPolicyMockService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri)];

        return of(resource);
    }
}
