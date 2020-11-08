import { Observable, of } from 'rxjs';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTPurposeService } from './dgt-purpose.service';
import { DGTPurpose } from '../models/dgt-purpose.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { switchMap } from 'rxjs/operators';

@DGTInjectable()
export class DGTPurposeMockService extends DGTPurposeService {
    public resources: DGTPurpose[] = [];

    constructor(private logger: DGTLoggerService, private filters: DGTLDFilterService) {
        super();
    }

    public get(uri: string): Observable<DGTPurpose> {
        return of(this.resources.find(e => e.uri === uri));
    }

    public query(filter?: DGTLDFilter): Observable<DGTPurpose[]> {
        this.logger.debug(DGTPurposeMockService.name, 'Starting to query purposes', filter);

        return of({ filter, resources: this.resources })
            .pipe(
                switchMap(data => data.filter ? this.filters.run<DGTPurpose>(data.filter, data.resources) : of(data.resources)),
            )
    }

    public save(resource: DGTPurpose): Observable<DGTPurpose> {
        this.logger.debug(DGTPurposeMockService.name, 'Starting to save resource', { resource });

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

    public delete(resource: DGTPurpose): Observable<DGTPurpose> {
        this.logger.debug(DGTPurposeMockService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri)];

        return of(resource);
    }
}
