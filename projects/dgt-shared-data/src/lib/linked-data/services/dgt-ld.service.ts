import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { Observable, of, forkJoin, zip } from 'rxjs';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { mergeMap, tap, map, switchMap } from 'rxjs/operators';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import * as _ from 'lodash';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTWorkflowService } from '../../workflow/services/dgt-workflow.service';

@DGTInjectable()
export class DGTLDService {

    constructor(
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private exchanges: DGTExchangeService,
        private paramChecker: DGTParameterCheckerService,
        private connectors: DGTConnectorService,
        private workflows: DGTWorkflowService
    ) {
    }

    public query<T extends DGTLDResource>(filter: DGTLDFilter, transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.debug(DGTLDService.name, 'Querying cache', { filter, transformer });

        return of({ filter, transformer })
            .pipe(
                switchMap(data => this.exchanges.query({})
                    .pipe(map(exchanges => ({ ...data, exchanges })))),
                tap(data => this.logger.debug(DGTLDService.name, 'Retrieved exchanges', data)),
                mergeMap(data => zip(...data.exchanges.map(exchange => this.queryForExchange(exchange, data.transformer)))
                    .pipe(map(valuesOfValues => ({ ...data, values: _.flatten(valuesOfValues) })))),
                switchMap(data => this.cache.save<T>(transformer, data.values)
                    .pipe(map(saved => ({ ...data, saved })))),
                tap(data => this.logger.debug(DGTLDService.name, 'Stored values in cache', data)),
                switchMap(data => this.cache.query<T>(transformer, filter)),
            );
    }

    private queryForExchange<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.debug(DGTLDService.name, 'Getting values for exchange', { exchange });

        this.paramChecker.checkParametersNotNull({ exchange });

        return of({ exchange, transformer })
            .pipe(
                switchMap((data) => this.connectors.query<T>(data.exchange, transformer)
                    .pipe(map(resources => ({ ...data, resources })))),
                switchMap(data => this.workflows.execute<T>(data.exchange, data.resources))
            );
    }
}
