
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
        // this.paramChecker.checkParametersNotNull({ filter, transformer });
        this.logger.debug(DGTLDService.name, 'Querying cache', { filter, transformer });
        // check cache
        // if (!this.cache.isFilled()) {
        //     return this.fillCacheFromDataService().pipe(
        //         mergeMap(_ => this.cache.query<T>(filter, transformer)),
        //     );
        // }
        // return this.cache.query<T>(filter, transformer);

        return this.fillCacheFromDataService().pipe(
            mergeMap(_ => this.cache.query<T>(filter, transformer)),
        );
    }

    private fillCacheFromDataService(): Observable<DGTLDTriple[]> {
        return this.exchanges.query({})
            .pipe(
                tap(val => this.logger.debug(DGTLDService.name, 'Retrieved exchanges', val)),
                mergeMap(exchanges => of(exchanges).pipe(
                    mergeMap(exchanges => forkJoin(exchanges.map(exchange => this.connections.get(exchange.connection).pipe(
                        mergeMap(connection => this.getValuesForExchange(exchange, connection)),
                        mergeMap( values => this.workflows.execute(exchange, values)),
                    )
                    ))),
                    tap(val => this.logger.debug(DGTLDService.name, 'Retrieved values for exchanges', { val })),
                    map(val => _.flatten(val))
                )),
                tap(values => this.cache.cache = values)
            );
    }

    private getValuesForExchange(exchange: DGTExchange, connection: DGTConnection<any>): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTLDService.name, 'Getting values for exchange ', { exchange, connection });
        this.paramChecker.checkParametersNotNull({ exchange, connection });
        return of({ exchange, connection })
            .pipe(
                switchMap((data) => this.purposes.get(data.exchange.purpose)
                    .pipe(map(purpose => ({ purpose, ...data })))),
                switchMap((data) => this.sources.get(data.exchange.source)
                    .pipe(map(source => ({ source, ...data })))),
                switchMap((data) => this.connectors.getTriples(data.exchange, data.connection, data.source, data.purpose)),
            );
    }
}
