import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTConnectorService } from '../../connector/services/dgt-connector.service';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTUriFactoryService } from '../../uri/services/dgt-uri-factory.service';
import { DGTWorkflow } from '../models/dgt-workflow.model';
import { DGTWorkflowService } from './dgt-workflow.service';

@DGTInjectable()
export class DGTWorkflowMockService extends DGTWorkflowService {
    public workflows: DGTWorkflow[] = [];

    constructor(
        private uri: DGTUriFactoryService,
        protected logger: DGTLoggerService,
        protected paramChecker: DGTParameterCheckerService,
        protected filters: DGTLDFilterService,
        protected connectors: DGTConnectorService,
        protected exchanges: DGTExchangeService,
    ) {
        super(logger, filters, connectors, exchanges);
    }

    public get(workflowUri: string): Observable<DGTWorkflow> {
        return of(this.workflows.find(e => e.uri === workflowUri));
    }

    public query<T extends DGTWorkflow>(filter?: DGTLDFilter): Observable<T[]> {
        this.logger.debug(DGTWorkflowMockService.name, 'Starting to query workflows', filter);

        return of({ filter, workflows: this.workflows as T[] })
            .pipe(
                switchMap(data => data.filter ? this.filters.run<T>(data.filter, data.workflows) : of(data.workflows)),
            );
    }

    public save<T extends DGTWorkflow>(workflows: T[]): Observable<T[]> {
        this.logger.debug(DGTWorkflowMockService.name, 'Starting to save workflows', { workflows });

        if (!workflows) {
            throw new DGTErrorArgument('Argument connection should be set.', workflows);
        }

        return of({ workflows })
            .pipe(
                map(data => data.workflows.map(workflow => {
                    if (!workflow.uri) {
                        workflow.uri = this.uri.generate(workflow, 'workflow');
                    }

                    this.workflows = [...this.workflows.filter(c => c && c.uri !== workflow.uri), workflow];

                    return workflow;
                }),
                ),
            );
    }

    public delete(workflow: DGTWorkflow): Observable<DGTWorkflow> {
        this.logger.debug(DGTWorkflowMockService.name, 'Starting to delete workflow', { workflow });

        if (!workflow) {
            throw new DGTErrorArgument('Argument workflow should be set.', workflow);
        }

        this.workflows = [...this.workflows.filter(c => c && c.uri !== workflow.uri)];

        return of(workflow);
    }
}
