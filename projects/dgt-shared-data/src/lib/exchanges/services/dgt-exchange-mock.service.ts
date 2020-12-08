import { Observable, of } from 'rxjs';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTExchange } from '../models/dgt-exchange.model';
import { DGTExchangeService } from './dgt-exchange.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { map, switchMap } from 'rxjs/operators';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';

@DGTInjectable()
export class DGTExchangeMockService extends DGTExchangeService {
    public resources: DGTExchange[] = [];

    constructor(private logger: DGTLoggerService, private filters: DGTLDFilterService, private uri: DGTUriFactoryService,) {
        super();
    }

    public get(uri: string): Observable<DGTExchange> {
        return of(this.resources.find(e => e.uri === uri));
    }

    public query(filter?: DGTLDFilter): Observable<DGTExchange[]> {
        this.logger.debug(DGTExchangeMockService.name, 'Starting to query exchanges', filter);

        return of({ filter, resources: this.resources })
            .pipe(
                switchMap(data => data.filter ? this.filters.run<DGTExchange>(data.filter, data.resources) : of(data.resources)),
            )
    }

    public save(resources: DGTExchange[]): Observable<DGTExchange[]> {
        this.logger.debug(DGTExchangeMockService.name, 'Starting to save resources', { resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument connection should be set.', resources);
        }

        return of({ resources })
            .pipe(
                map(data => data.resources.map(resource => {
                    if (!resource.uri) {
                        resource.uri = this.uri.generate(resource, 'exchange');
                    }

                    this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri), resource];

                    return resource;
                })
                )
            );
    }

    public delete(resource: DGTExchange): Observable<DGTExchange> {
        this.logger.debug(DGTExchangeMockService.name, 'Starting to delete resource', { resource });

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        this.resources = [...this.resources.filter(c => c && c.uri !== resource.uri)];

        return of(resource);
    }
}