import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTPurpose } from '../models/dgt-purpose.model';
import { DGTPurposeService } from './dgt-purpose.service';

@DGTInjectable()
export class DGTPurposeMockService extends DGTPurposeService {
    public resources: DGTPurpose[] = [];

    constructor(private logger: DGTLoggerService, private filters: DGTLDFilterService, private uri: DGTUriFactoryService) {
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

    public save(resources: DGTPurpose[]): Observable<DGTPurpose[]> {
        this.logger.debug(DGTPurposeMockService.name, 'Starting to save resources', { resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({ resources })
            .pipe(
                switchMap((data) =>
                this.uri
                    .generate(data.resources, 'purpose')
                    .pipe(map((updatedResources) => ({ ...data, resources: updatedResources as DGTPurpose[] }))),
            ),
                map(data => data.resources.map(resource => {
                    this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri), resource];

                    return resource;
                }),
                ),
            );
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
