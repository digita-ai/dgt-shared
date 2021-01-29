import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTGroupTransformerService } from './dgt-group-transformer.service';
import { DGTGroupService } from './dgt-group.service';
import { DGTDataGroup } from '../models/data-group.model';

@DGTInjectable()
export class DGTGroupCacheService extends DGTGroupService {
    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTGroupTransformerService,
        private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTDataGroup> {
        this.logger.debug(DGTGroupCacheService.name, 'Starting to get groups', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTDataGroup>(this.transformer, uri);
    }

    public query<T extends DGTDataGroup>(filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTGroupCacheService.name, 'Starting to query groups', filter);

        return this.cache.query<T>(this.transformer, filter);
    }

    public save<T extends DGTDataGroup>(resources: T[]): Observable<T[]> {
        this.logger.debug(DGTGroupCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument group should be set.', resources);
        }

        return of({ resources }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'group')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as T[] }))),
            ),
            switchMap((data) =>
                this.cache.save<T>(this.transformer, data.resources).pipe(map((savedResources) => savedResources)),
            ),
        );
    }

    public delete(resource: DGTDataGroup): Observable<DGTDataGroup> {
        this.logger.debug(DGTGroupCacheService.name, 'Starting to delete group', { resource });

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
