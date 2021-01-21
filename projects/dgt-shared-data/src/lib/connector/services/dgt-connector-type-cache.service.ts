import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTConnectorType } from '../models/dgt-connector-type.model';
import { DGTConnectorTypeTransformerService } from './dgt-connector-type-transformer.service';
import { DGTConnectorTypeService } from './dgt-connector-type.service';

@DGTInjectable()
export class DGTConnectorTypeCacheService extends DGTConnectorTypeService {
    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private transformer: DGTConnectorTypeTransformerService,
        private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(uri: string): Observable<DGTConnectorType> {
        this.logger.debug(DGTConnectorTypeCacheService.name, 'Starting to get connectortypes', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTConnectorType>(this.transformer, uri);
    }

    public query<T extends DGTConnectorType>(filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTConnectorTypeCacheService.name, 'Starting to query connectortypes', filter);

        return this.cache.query<T>(this.transformer, filter);
    }

    public save<T extends DGTConnectorType>(resources: T[]): Observable<T[]> {
        this.logger.debug(DGTConnectorTypeCacheService.name, 'Starting to save resource', { resource: resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connectortype should be set.', resources);
        }

        return of({
            resources,
        }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'connectortype')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as T[] }))),
            ),
            switchMap((data) =>
                this.cache.save<T>(this.transformer, data.resources).pipe(map((savedResources) => savedResources)),
            ),
        );
    }

    public delete(resource: DGTConnectorType): Observable<DGTConnectorType> {
        this.logger.debug(DGTConnectorTypeCacheService.name, 'Starting to delete connectortype', { resource });

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
