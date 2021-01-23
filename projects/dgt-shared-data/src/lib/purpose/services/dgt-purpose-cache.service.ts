import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTPurpose } from '../models/dgt-purpose.model';
import { DGTPurposeTransformerService } from './dgt-purpose-transformer.service';
import { DGTPurposeService } from './dgt-purpose.service';

@DGTInjectable()
export class DGTPurposeCacheService extends DGTPurposeService {
    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTPurposeTransformerService,
        private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTPurpose> {
        this.logger.debug(DGTPurposeCacheService.name, 'Starting to get exchange', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTPurpose>(this.transformer, uri);
    }

    public query(filter?: DGTLDFilter): Observable<DGTPurpose[]> {
        this.logger.debug(DGTPurposeCacheService.name, 'Starting to query exchanges', filter);

        return this.cache.query(this.transformer, filter);
    }

    public save(resources: DGTPurpose[]): Observable<DGTPurpose[]> {
        this.logger.debug(DGTPurposeCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({
            resources,
        }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'purpose')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as DGTPurpose[] }))),
            ),
            switchMap((data) => this.cache.save(this.transformer, data.resources)),
        );
    }

    public delete(resource: DGTPurpose): Observable<DGTPurpose> {
        this.logger.debug(DGTPurposeCacheService.name, 'Starting to delete resource', { resource });

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
