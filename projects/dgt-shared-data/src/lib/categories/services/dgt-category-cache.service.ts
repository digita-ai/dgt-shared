import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTCategory } from '../models/dgt-category.model';
import { DGTCategoryTransformerService } from './dgt-category-transformer.service';
import { DGTCategoryService } from './dgt-category.service';

@DGTInjectable()
export class DGTCategoryCacheService extends DGTCategoryService  {

    constructor(
        private cache: DGTCacheService,
        private logger: DGTLoggerService,
        private transformer: DGTCategoryTransformerService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTCategory> {

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTCategory>(this.transformer, uri);
    }
    public query(filter?: DGTLDFilter): Observable<DGTCategory[]> {
        this.logger.debug(DGTCategoryCacheService.name, 'Starting to query categories', filter);

        return this.cache.query(this.transformer, filter);
    }
    public save(resource: DGTCategory): Observable<DGTCategory> {
        this.logger.debug(DGTCategoryCacheService.name, 'Starting to save resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        if (!resource.uri) {
            resource.uri = `http://someuri/exchanges#${v4()}`; // TODO set according to strategy
        }

        return of({ resource })
            .pipe(
                switchMap(data => this.cache.save(this.transformer, [resource])
                    .pipe(map(resources => _.head(resources)))),
            );
    }
    public delete(resource: DGTCategory): Observable<DGTCategory> {
        this.logger.debug(DGTCategoryCacheService.name, 'Starting to delete resource', { resource });

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
