import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTHolder } from '../models/dgt-holder.model';
import { DGTHolderService } from './dgt-holder-abstract.service';
import { DGTHolderTransformerService } from './dgt-holder-transformer.service';

@DGTInjectable()
export class DGTHolderCacheService extends DGTHolderService {
    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTHolderTransformerService,
        private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTHolder> {
        this.logger.debug(DGTHolderCacheService.name, 'Starting to get holder', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTHolder>(this.transformer, uri);
    }

    public query(filter?: DGTLDFilter): Observable<DGTHolder[]> {
        this.logger.debug(DGTHolderCacheService.name, 'Starting to query holders', filter);

        return this.cache.query(this.transformer, filter);
    }

    public save(resources: DGTHolder[]): Observable<DGTHolder[]> {
        this.logger.debug(DGTHolderCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({
            resources,
        }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'holder')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as DGTHolder[] }))),
            ),
            concatMap((data) => this.cache.save(this.transformer, data.resources).pipe(map((res) => res))),
        );
    }

    public delete(resource: DGTHolder): Observable<DGTHolder> {
        this.logger.debug(DGTHolderCacheService.name, 'Starting to delete resource', { resource });

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
