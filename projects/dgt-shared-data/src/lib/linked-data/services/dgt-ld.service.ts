import { Injectable } from '@angular/core';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDTransformer } from '../models/dgt-ld-transformer.model';
import { Observable, of, forkJoin } from 'rxjs';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { mergeMap, tap, map, switchMap } from 'rxjs/operators';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTSource } from '../../source/models/dgt-source.model';
import * as _ from 'lodash';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTDataService } from '../../metadata/services/dgt-data.service';
import { DGTPurpose } from '../../purpose/models/dgt-purpose.model';

@Injectable()
export class DGTLDService {

    constructor(
        private sources: DGTSourceService,
        private logger: DGTLoggerService,
        private cache: DGTCacheService,
        private data: DGTDataService,
        private paramChecker: DGTParameterCheckerService,
    ) {
    }

    public query<T>(filter: DGTLDFilter, transformer: DGTLDTransformer<T>): Observable<DGTLDTriple[] | T[]> {
        // this.paramChecker.checkParametersNotNull({ filter, transformer });
        this.logger.debug(DGTLDService.name, 'Querying cache', { filter, transformer });
        // check cache
        if (!this.cache.isFilled()) {
            return this.fillCacheFromDataService().pipe(
                mergeMap(_ => this.cache.query<T>(filter, transformer)),
            );
        }
        return this.cache.query<T>(filter, transformer);
    }

    private fillCacheFromDataService(): Observable<DGTLDTriple[]> {
        return this.data.getEntities<DGTExchange>('exchange', null)
            .pipe(
                mergeMap(exchanges => of(exchanges).pipe(
                    mergeMap(exchanges => forkJoin(exchanges.map(exchange => this.data.getEntity<DGTConnection<any>>('connection', exchange.connection).pipe(
                        // TODO pump values into workflows 
                        mergeMap(connection => this.getValuesForExchange(exchange, connection))
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
                switchMap((data) => this.data.getEntity<DGTPurpose>('justification', data.exchange.purpose)
                    .pipe(map(purpose => ({ purpose, ...data })))),
                switchMap((data) => this.data.getEntity<DGTSource<any>>('source', data.exchange.source)
                    .pipe(map(source => ({ source, ...data })))),
                switchMap((data) => this.sources.getTriples(data.exchange, data.connection, data.source, data.purpose)),
            );
    }
}
