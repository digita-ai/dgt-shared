import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTSource } from '../models/dgt-source.model';
import { DGTSourceTransformerService } from './dgt-source-transformer.service';
import { DGTSourceService } from './dgt-source.service';

@DGTInjectable()
export class DGTSourceCacheService extends DGTSourceService {
    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTSourceTransformerService,
        private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTSource<any>> {
        this.logger.debug(DGTSourceCacheService.name, 'Starting to get source<any>', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTSource<any>>(this.transformer, uri);
    }

    public query(filter?: DGTLDFilter): Observable<DGTSource<any>[]> {
        this.logger.debug(DGTSourceCacheService.name, 'Starting to query source<any>s', filter);

        return this.cache.query(this.transformer, filter);
    }

    public save(resources: DGTSource<any>[]): Observable<DGTSource<any>[]> {
        this.logger.debug(DGTSourceCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({
            resources,
        }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'source')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as DGTSource<any>[] }))),
            ),
            switchMap((data) => this.cache.save(this.transformer, data.resources).pipe(map((res) => res))),
        );
    }

    public delete(resource: DGTSource<any>): Observable<DGTSource<any>> {
        this.logger.debug(DGTSourceCacheService.name, 'Starting to delete resource', { resource });

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

    public refresh(source: DGTSource<any>): Observable<DGTLDResource[]> {
        throw new DGTErrorNotImplemented();
    }
}
