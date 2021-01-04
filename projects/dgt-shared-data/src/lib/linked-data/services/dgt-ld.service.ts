import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of, zip } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTSparqlResult } from '../../sparql/models/dgt-sparql-result.model';
import { DGTWorkflowService } from '../../workflow/services/dgt-workflow.service';
import { DGTLDFilterSparql } from '../models/dgt-ld-filter-sparql.model';
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
        private paramChecker: DGTParameterCheckerService,
        private connectors: DGTConnectorService,
        private workflows: DGTWorkflowService,
        private transformer: DGTLDResourceTransformerService,
    ) {
    }

    /**
     * Retrieves all pod data for every exchange known
     * @param filter The filter to execute on the results
     * @param transformer The transformer used to transform DGTLDResources
     */
    public query<T extends DGTLDResource>(filter: DGTLDFilter, transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.debug(DGTLDService.name, 'Querying cache', { filter, transformer });

        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ filter, transformer })
            .pipe(
                switchMap(data => this.exchanges.query()
                    .pipe(map(exchanges => ({ ...data, exchanges })))),
                tap(data => this.logger.debug(DGTLDService.name, 'Retrieved exchanges', data)),
                mergeMap(data => zip(...data.exchanges.map(exchange => this.queryForExchange(exchange, data.transformer)))
                    .pipe(map(valuesOfValues => ({ ...data, values: _.flatten(valuesOfValues) })))),
                tap(data => this.logger.debug(DGTLDService.name, 'Queried values', {results: data.values})),
                switchMap(data => this.cache.save<T>(transformer, data.values)
                    .pipe(map(saved => ({ ...data, saved })))),
                tap(data => this.logger.debug(DGTLDService.name, 'Stored values in cache', data)),
                switchMap(() => this.cache.query<T>(transformer, filter)),
            );
    }

    public querySparql(query: string): Observable<DGTSparqlResult> {
        this.logger.debug(DGTLDService.name, 'Querying cache', { query });

        if (!query) {
            throw new DGTErrorArgument('Argument query should be set.', query);
        }

        return of({ query })
            .pipe(
                switchMap(data => this.exchanges.query()
                    .pipe(map(exchanges => ({ ...data, exchanges })))),
                tap(data => this.logger.debug(DGTLDService.name, 'Retrieved exchanges', data)),
                mergeMap(data => zip(...data.exchanges.map(exchange => this.queryForExchange(exchange, this.transformer)))
                    .pipe(map(valuesOfValues => ({ ...data, values: _.flatten(valuesOfValues) })))),
                tap(data => this.logger.debug(DGTLDService.name, 'Queried values', {results: data.values})),
                switchMap(data => this.cache.save<DGTLDResource>(this.transformer, data.values)
                    .pipe(map(saved => ({ ...data, saved })))),
                tap(data => this.logger.debug(DGTLDService.name, 'Stored values in cache', data)),
                switchMap(data => this.cache.querySparql(data.query)),
            );
    }

    /**
     * Retrieves pod data for a single exchange
     * @param exchange The exchange to query for
     * @param transformer The transformer used to transform DGTLDResources
     */
    private queryForExchange<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.debug(DGTLDService.name, 'Getting values for exchange', { exchange });

        this.paramChecker.checkParametersNotNull({ exchange });

        return of({ exchange, transformer })
            .pipe(
                switchMap((data) => this.connectors.query<T>(data.exchange, transformer)
                    .pipe(map(resources => ({ ...data, resources })))),
                switchMap(data => this.workflows.execute<T>(data.exchange, data.resources)),
            );
    }
}
