import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTCacheService } from '../../cache/services/dgt-cache.service';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTWorkflow } from '../models/dgt-workflow.model';
import { DGTWorkflowTransformerService } from './dgt-workflow-transformer.service';
import { DGTWorkflowService } from './dgt-workflow.service';

@DGTInjectable()
export class DGTWorkflowCacheService extends DGTWorkflowService {

    constructor(
        private cache: DGTCacheService,
        private transformer: DGTWorkflowTransformerService,
        private uri: DGTUriFactoryService,
        protected logger: DGTLoggerService,
        protected paramChecker: DGTParameterCheckerService,
        protected filters: DGTLDFilterService,
        protected connectors: DGTConnectorService,
        protected exchanges: DGTExchangeService,
    ) {
        super(logger, filters, connectors, exchanges);
    }

    public get(uri: string): Observable<DGTWorkflow> {
        this.logger.debug(DGTWorkflowCacheService.name, 'Starting to get workflows', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return this.cache.get<DGTWorkflow>(this.transformer, uri);
    }

    public query<T extends DGTWorkflow>(filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTWorkflowCacheService.name, 'Starting to query workflows', filter);

        return this.cache.query<T>(this.transformer, filter);
    }

    public save<T extends DGTWorkflow>(workflows: T[]): Observable<T[]> {
        this.logger.debug(DGTWorkflowCacheService.name, 'Starting to save workflow', { workflow: workflows });

        if (!workflows) {
            throw new DGTErrorArgument('Argument workflow should be set.', workflows);
        }

        return of({
            workflows: workflows.map(workflow => {
                if (!workflow.uri) {
                    workflow.uri = this.uri.generate(workflow, 'workflow');
                }

                return workflow;
            }),
        })
            .pipe(
                switchMap(data => this.cache.save<T>(this.transformer, data.workflows)
                    .pipe(map(savedResources => savedResources))),
            );
    }

    public delete(workflow: DGTWorkflow): Observable<DGTWorkflow> {
        this.logger.debug(DGTWorkflowCacheService.name, 'Starting to delete workflow', { workflow });

        if (!workflow) {
            throw new DGTErrorArgument('Argument workflow should be set.', workflow);
        }

        return of({ workflow })
            .pipe(
                switchMap(data => this.cache.delete(this.transformer, [data.workflow])
                    .pipe(map(workflows => ({ ...data, workflows })))),
                map(data => _.head(data.workflows)),
            );
    }
}
