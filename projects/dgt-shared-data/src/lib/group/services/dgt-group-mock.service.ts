import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTDataGroup } from '../models/data-group.model';
import { DGTGroupService } from './dgt-group.service';

@DGTInjectable()
export class DGTGroupMockService extends DGTGroupService {
    public resources: DGTDataGroup[] = [];

    constructor(
        private logger: DGTLoggerService,
        private filters: DGTLDFilterService,
        private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(groupUri: string): Observable<DGTDataGroup> {
        return of(this.resources.find((e) => e.uri === groupUri));
    }

    public query(filter?: DGTLDFilter): Observable<DGTDataGroup[]> {
        this.logger.debug(DGTGroupMockService.name, 'Starting to query groups', filter);

        return of({ filter, resources: this.resources }).pipe(
            switchMap((data) =>
                data.filter ? this.filters.run<DGTDataGroup>(data.filter, data.resources) : of(data.resources),
            ),
        );
    }

    public save<T extends DGTDataGroup>(resources: T[]): Observable<T[]> {
        this.logger.debug(DGTGroupMockService.name, 'Starting to save resources', { resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        return of({ resources }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'group')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as T[] }))),
            ),
            map((data) =>
                data.resources.map((resource) => {
                    this.resources = [...this.resources.filter((c) => c && c.uri !== resource.uri), resource];

                    return resource;
                }),
            ),
        );
    }

    public delete(resource: DGTDataGroup): Observable<DGTDataGroup> {
        this.logger.debug(DGTGroupMockService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        this.resources = [...this.resources.filter((c) => c && c.uri !== resource.uri)];

        return of(resource);
    }
}
