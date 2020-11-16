import { Observable, of } from 'rxjs';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { map, switchMap } from 'rxjs/operators';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTSecurityCredentialTransformerService } from './dgt-security-credential-transformer.service';
import { DGTSecurityCredentialService } from './dgt-security-credential.service';
import { DGTSecurityCredential } from '../models/dgt-security-credential.model';

@DGTInjectable()
export class DGTSecurityCredentialCacheService extends DGTSecurityCredentialService {

    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTSecurityCredentialTransformerService,
        private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTSecurityCredential> {
        this.logger.debug(DGTSecurityCredentialCacheService.name, 'Starting to get credentials', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTSecurityCredential>(this.transformer, uri);
    }

    public query<T extends DGTSecurityCredential>(filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTSecurityCredentialCacheService.name, 'Starting to query credentials', filter);

        return this.cache.query<T>(this.transformer, filter);
    }

    public save(resource: DGTSecurityCredential): Observable<DGTSecurityCredential> {
        this.logger.debug(DGTSecurityCredentialCacheService.name, 'Starting to save credential', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        if (!resource.uri) {
            resource.uri = this.uri.generate(resource, 'exchange');
        }

        return of({ resource })
            .pipe(
                switchMap(data => this.cache.save(this.transformer, [resource])
                    .pipe(map(resources => _.head(resources)))),
            );
    }

    public delete(resource: DGTSecurityCredential): Observable<DGTSecurityCredential> {
        this.logger.debug(DGTSecurityCredentialCacheService.name, 'Starting to delete credential', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ resource })
            .pipe(
                switchMap(data => this.cache.delete(this.transformer, [data.resource])
                    .pipe(map(resources => ({ ...data, resources })))),
                map(data => _.head(data.resources))
            );
    }
}
