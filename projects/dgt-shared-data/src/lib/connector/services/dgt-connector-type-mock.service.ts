import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTConnectorType } from '../models/dgt-connector-type.model';
import { DGTConnectorTypeService } from './dgt-connector-type.service';

@DGTInjectable()
export class DGTConnectorTypeMockService extends DGTConnectorTypeService {
    public resources: DGTConnectorType[] = [];

    constructor(
        private logger: DGTLoggerService,
        private filters: DGTLDFilterService,
        private uri: DGTUriFactoryService,
    ) {
        super();
    }

    public get(connectortypeUri: string): Observable<DGTConnectorType> {
        return of(this.resources.find((e) => e.uri === connectortypeUri));
    }

    public query<T extends DGTConnectorType>(filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTConnectorTypeMockService.name, 'Starting to query connectortypes', filter);

        return of({ filter, resources: this.resources as T[] }).pipe(
            switchMap((data) => (data.filter ? this.filters.run<T>(data.filter, data.resources) : of(data.resources))),
        );
    }

    public save<T extends DGTConnectorType>(resources: T[]): Observable<T[]> {
        this.logger.debug(DGTConnectorTypeMockService.name, 'Starting to save resources', { resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({ resources }).pipe(
            switchMap((data) =>
                this.uri
                    .generate(data.resources, 'connectortype')
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

    public delete(resource: DGTConnectorType): Observable<DGTConnectorType> {
        this.logger.debug(DGTConnectorTypeMockService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        this.resources = [...this.resources.filter((c) => c && c.uri !== resource.uri)];

        return of(resource);
    }
}
