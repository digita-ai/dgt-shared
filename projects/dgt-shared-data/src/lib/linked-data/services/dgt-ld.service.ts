
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { Observable, of, forkJoin } from 'rxjs';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { mergeMap, tap, map, switchMap } from 'rxjs/operators';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import * as _ from 'lodash';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTPurposeService } from '../../purpose/services/dgt-purpose.service';
import { DGTWorkflowService } from '../../workflow/services/dgt-workflow.service';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';

@DGTInjectable()
export class DGTLDService {

    constructor(
        private sources: DGTSourceService,
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private exchanges: DGTExchangeService,
        private connections: DGTConnectionService,
        private purposes: DGTPurposeService,
        private paramChecker: DGTParameterCheckerService,
        private workflows: DGTWorkflowService,
        private connectors: DGTConnectorService,
    ) {
    }

    public query<T>(filter: DGTLDFilter, transformer: DGTLDTransformer<T>): Observable<DGTLDTriple[] | T[]> {
        this.logger.debug(DGTLDService.name, 'Querying cache', { filter, transformer });

        return of({})
            .pipe(
                switchMap(data => this.exchanges.query({})
                    .pipe(map(exchanges => ({ ...data, exchanges })))),
                tap(data => this.logger.debug(DGTLDService.name, 'Retrieved exchanges', data)),
                mergeMap(data => forkJoin(data.exchanges.map(exchange => this.getValuesForExchange(exchange)))
                    .pipe(map(valuesOfValues => ({ ...data, values: _.flatten(valuesOfValues) })))),
                tap(data => this.cache.cache = data.values),
                tap(data => this.logger.debug(DGTLDService.name, `Stored ${data.values.length} valeues and ${data.exchanges.length} exchanges in cache`)),
                mergeMap(_ => this.cache.query<T>(filter, transformer)),
            );
    }

    private getValuesForExchange(exchange: DGTExchange): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTLDService.name, 'Getting values for exchange', { exchange });

        this.paramChecker.checkParametersNotNull({ exchange });

        return of({ exchange })
            .pipe(
                switchMap(data => this.connections.get(exchange.connection)
                    .pipe(map(connection => ({ ...data, connection })))),
                switchMap((data) => this.purposes.get(data.exchange.purpose)
                    .pipe(map(purpose => ({ purpose, ...data })))),
                switchMap((data) => this.sources.get(data.exchange.source)
                    .pipe(map(source => ({ source, ...data })))),
                switchMap((data) => this.connectors.query(data.exchange, data.connection, data.source, data.purpose)
                    .pipe(map(values => ({ ...data, values })))),
                switchMap(data => this.workflows.execute(data.exchange, data.values))
            );
    }
}
