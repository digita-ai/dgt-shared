import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of, zip } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTSparqlResult } from '../../sparql/models/dgt-sparql-result.model';
import { DGTWorkflowService } from '../../workflow/services/dgt-workflow.service';
import { DGTLDFilterExchange } from '../models/dgt-ld-filter-exchange.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { DGTLDResourceTransformerService } from './dgt-ld-resource-transformer.service';

/**
 * The service exists to retrieve all data from Solid pods
 */
@DGTInjectable()
export class DGTLDService {
    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private exchanges: DGTExchangeService,
        private connectors: DGTConnectorService,
        private workflows: DGTWorkflowService,
        private transformer: DGTLDResourceTransformerService,
    ) {}

    /**
     * Retrieves all pod data for every exchange known
     * @param filter The filter to execute on the results
     * @param transformer The transformer used to transform DGTLDResources
     */
    public query<T extends DGTLDResource>(filter: DGTLDFilter, transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.debug(DGTLDService.name, 'Querying data', { filter, transformer });

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ filter, transformer }).pipe(
            switchMap((data) => this.exchanges.query().pipe(map((exchanges) => ({ ...data, exchanges })))),
            tap((data) => this.logger.debug(DGTLDService.name, 'Retrieved exchanges', data)),
            switchMap((data) =>
                zip(
                    ...data.exchanges
                        .filter((exchange) => exchange !== null)
                        .map((exchange) =>
                            this.connectors
                                .query<T>(exchange, data.transformer)
                                .pipe(
                                    switchMap((resources) =>
                                        this.workflows.execute<T>(exchange, resources, data.transformer),
                                    ),
                                ),
                        ),
                ).pipe(map((resourcesOfResources) => ({ ...data, resources: _.flatten(resourcesOfResources) }))),
            ),
            tap((data) => this.logger.info(DGTLDService.name, 'Refreshed resources', { resources: data.resources })),
            switchMap((data) =>
                this.cache.save<T>(transformer, data.resources).pipe(map((saved) => ({ ...data, saved }))),
            ),
            tap((data) => this.logger.debug(DGTLDService.name, 'Stored resources in cache', data)),
            switchMap(() => this.cache.query<T>(transformer, filter)),
        );
    }

    public querySparql(query: string): Observable<DGTSparqlResult> {
        this.logger.debug(DGTLDService.name, 'Querying cache', { query });

        if (!query) {
            throw new DGTErrorArgument('Argument query should be set.', query);
        }

        return of({ query }).pipe(
            switchMap((data) => this.exchanges.query().pipe(map((exchanges) => ({ ...data, exchanges })))),
            tap((data) => this.logger.debug(DGTLDService.name, 'Retrieved exchanges', data)),
            mergeMap((data) =>
                zip(
                    ...data.exchanges.map((exchange) =>
                        this.connectors.query<DGTLDResource>(exchange, this.transformer),
                    ),
                ).pipe(map((valuesOfValues) => ({ ...data, values: _.flatten(valuesOfValues) }))),
            ),
            tap((data) => this.logger.debug(DGTLDService.name, 'Queried values', { results: data.values })),
            switchMap((data) =>
                this.cache
                    .save<DGTLDResource>(this.transformer, data.values)
                    .pipe(map((saved) => ({ ...data, saved }))),
            ),
            tap((data) => this.logger.debug(DGTLDService.name, 'Stored values in cache', data)),
            switchMap((data) => this.cache.querySparql(data.query)),
        );
    }
}
