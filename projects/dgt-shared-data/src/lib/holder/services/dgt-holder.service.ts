import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map, tap, mergeMap } from 'rxjs/operators';
import { DGTExchange } from '../models/dgt-holder-exchange.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import * as _ from 'lodash';
import { DGTDataService } from '../../metadata/services/dgt-data.service';
import { Injectable } from '@angular/core';
import { DGTWorkflowService } from '../../workflow/services/dgt-workflow.service';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTHolder } from '../models/dgt-holder.model';

@Injectable()
export class DGTHolderService {
    constructor(
        private logger: DGTLoggerService,
        private data: DGTDataService,
        private cache: DGTCacheService,
        private workflow: DGTWorkflowService
    ) { }

    /**
     * Retrieves all values for a given holder
     * @param holder The holder for which values should be retrieved
     */
    public getValuesForHolder(holder: DGTHolder): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTHolderService.name, 'Getting holder values', { holder });
        return this.data.getEntities<DGTExchange>('exchange', { conditions: [{ field: 'holder', operator: '==', value: holder.id }] })
            .pipe(
                mergeMap(exchanges => {
                    if (exchanges.length) {
                        return of(exchanges).pipe(
                            mergeMap(xchngs => forkJoin(xchngs.map(xchng => this.getValuesForExchange(xchng)))),
                            tap(val => this.logger.debug(DGTHolderService.name, 'Retrieved values for exchanges', { val })),
                            map(val => _.flatten(val))
                        );
                    } else {
                        return of([]);
                    }
                }),
            );
    }

    /**
     * Retrieves all values for a given exchange
     * @param exchange The exchange for which values should be retrieved
     */
    public getValuesForExchange(exchange: DGTExchange): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTHolderService.name, 'Getting exchange values', { exchange });

        return of({ exchange })
            .pipe(
                switchMap(data => this.cache.getValuesForExchange(exchange)
                    .pipe(map(values => ({ values, ...data })))),
                switchMap(data => this.data.getEntity<DGTConnection<any>>('connection', exchange.connection)
                    .pipe(map(connection => ({ ...data, connection })))),
                switchMap(data => {
                    let res = of(data.values);

                    if (!data.values || data.values.length === 0) {
                        res = this.workflow.execute(exchange, data.connection)
                            .pipe(
                                switchMap((values) => this.cache.storeForExchange(exchange, values)),
                            );
                    }

                    return res;
                }),
            );
    }
}
