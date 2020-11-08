import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTCategory } from '../models/dgt-category.model';
import { DGTCategoryService } from './dgt-category.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';

@DGTInjectable()
export class DGTCategoryMockService extends DGTCategoryService {
    public resources: DGTCategory[] = [];

    constructor(private logger: DGTLoggerService, private filters: DGTLDFilterService) {
        super();
    }

    public get(categoryUri: string): Observable<DGTCategory> {
        return of(this.resources.find(e => e.uri === categoryUri));
    }

    public query(filter?: DGTLDFilter): Observable<DGTCategory[]> {
        this.logger.debug(DGTCategoryMockService.name, 'Starting to query categories', filter);

        return of({ filter, resources: this.resources })
        .pipe(
            switchMap(data => data.filter ? this.filters.run<DGTCategory>(data.filter, data.resources) : of(data.resources)),
        )
    }

    public save(resource: DGTCategory): Observable<DGTCategory> {
        this.logger.debug(DGTCategoryMockService.name, 'Starting to save resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument connection should be set.', resource);
        }

        if (!resource.uri) {
            this.resources = [...this.resources, resource];
        } else {
            this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri), resource];
        }

        return of(resource);
    }

    public delete(resource: DGTCategory): Observable<DGTCategory> {
        this.logger.debug(DGTCategoryMockService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri)];

        return of(resource);
    }
}
