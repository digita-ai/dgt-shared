import {
    DGTErrorArgument,
    DGTInjectable,
    DGTLoggerService,
    DGTMap,
    DGTParameterCheckerService,
} from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTExchange } from '../../exchanges/models/dgt-exchange.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDUtils } from '../../linked-data/services/dgt-ld-utils.service';
import { DGTPurposeService } from '../../purpose/services/dgt-purpose.service';
import { DGTSourceService } from '../../source/services/dgt-source.service';
import { DGTConnector } from '../models/dgt-connector.model';

@DGTInjectable()
export class DGTConnectorService {
    private connectors: DGTMap<string, DGTConnector<any, any>>;

    constructor(
        private logger: DGTLoggerService,
        private sources: DGTSourceService,
        private connections: DGTConnectionService,
        private paramChecker: DGTParameterCheckerService,
        private purposes: DGTPurposeService,
        private ldService: DGTLDUtils,
    ) {}

    public register(sourceType: string, connector: DGTConnector<any, any>) {
        this.paramChecker.checkParametersNotNull({ sourceType, connector });

        if (!this.connectors) {
            this.connectors = new DGTMap<string, DGTConnector<any, any>>();
        }

        this.connectors.set(sourceType, connector);
    }

    public get(sourceType: string) {
        if (!sourceType) {
            throw new DGTErrorArgument('Argument sourceType should be set.', sourceType);
        }

        return this.connectors.get(sourceType);
    }

    public save<T extends DGTLDResource>(
        exchange: DGTExchange,
        resources: T[],
        transformer: DGTLDTransformer<T>,
    ): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ exchange, triples: resources });

        return of({ exchange, resources, transformer }).pipe(
            switchMap((data) =>
                this.sources
                    .get(data.exchange.source)
                    .pipe(map((source) => ({ ...data, source, connector: this.connectors.get(source.type) }))),
            ),
            switchMap((data) =>
                this.connections.get(data.exchange.connection).pipe(map((connection) => ({ ...data, connection }))),
            ),
            mergeMap((data) => this.purposes.get(exchange.purpose).pipe(map((purpose) => ({ ...data, purpose })))),
            mergeMap((data) =>
                this.get(data.source.type)
                    .save<T>(data.resources, data.transformer)
                    .pipe(map((savedResources) => ({ ...data, resources: savedResources }))),
            ),
            catchError(() => {
                return [resources];
            }),
        ) as Observable<T[]>;
    }

    public query<T extends DGTLDResource>(exchange: DGTExchange, transformer: DGTLDTransformer<T>): Observable<T[]> {
        this.logger.debug(DGTConnectorService.name, 'Querying resources for exchange', { exchange });

        if (!exchange) {
            throw new DGTErrorArgument('Argument exchange should be set.', exchange);
        }

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        return of({ exchange }).pipe(
            switchMap((data) =>
                this.sources
                    .get(data.exchange.source)
                    .pipe(map((source) => ({ source, ...data, connector: this.get(source.type) }))),
            ),
            switchMap((data) =>
                data.connector.query<T>(exchange, transformer).pipe(map((resources) => ({ ...data, resources }))),
            ),
            tap((data) => this.logger.info(DGTConnectorService.name, 'Queried resources for exchange', data)),
            switchMap((data) => this.purposes.get(data.exchange.purpose).pipe(
                map(purpose => ({ ...data, purpose})),
            )),
            map((data) => ({
                ...data,
                resources: data.resources.map(res => this.ldService.filterResourceByPredicates(res, data.purpose.predicates)),
            })),
            map((data) => data.resources),
            catchError((error, caught) => {
                this.logger.error(DGTConnectorService.name, 'Error while querying connectors', error, {
                    exchange,
                    transformer,
                    caught,
                });

                return of([]);
            }),
        );
    }
}
