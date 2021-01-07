import { forkJoin, Observable, of } from 'rxjs';

import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import uuid from 'uuid';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDFilterBGP } from '../../linked-data/models/dgt-ld-filter-bgp.model';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDNode } from '../../linked-data/models/dgt-ld-node.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTMapFieldWorkflowAction } from '../actions/dgt-map-field.workflow-action';
import { DGTRemovePrefixWorkflowAction } from '../actions/dgt-remove-prefix.workflow-action';
import { DGTWorkflowActionType } from '../models/dgt-workflow-action-type.model';
import { DGTWorkflowAction } from '../models/dgt-workflow-action.model';
import { DGTWorkflow } from '../models/dgt-workflow.model';

/** Transforms linked data to workflows, and the other way around. */
@DGTInjectable()
export class DGTWorkflowTransformerService implements DGTLDTransformer<DGTWorkflow> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService,
    ) { }

    /**
     * Transforms multiple linked data entities to workflows.
     * @param workflows Linked data objects to be transformed to workflows
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of workflows
     */
    public toDomain<T extends DGTWorkflow>(resources: DGTLDResource[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entities: resources });

        return forkJoin(resources.map(entity => this.toDomainOne<T>(entity)))
            .pipe(
                map(workflows => _.flatten(workflows)),
            );
    }

    /**
     * Transformed a single linked data entity to workflows.
     * @param workflow The linked data entity to be transformed to workflows.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of workflows
     */
    private toDomainOne<T extends DGTWorkflow>(workflow: DGTLDResource): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entity: workflow });

        let res: DGTWorkflow[] = null;

        if (workflow && workflow.triples) {
            const workflowsubjectValues = workflow.triples.filter(value =>
                value.predicate === 'http://digita.ai/voc/workflows#workflow' &&
                value.subject.value.endsWith('workflow#'),
            );

            if (workflowsubjectValues) {
                res = workflowsubjectValues.map(workflowsubjectValue => this.transformOne(workflowsubjectValue, workflow));
            }
        }

        this.logger.debug(DGTWorkflowTransformerService.name, 'Transformed values to workflows', { entity: workflow, res });

        return of(res as T[]);
    }

    /**
     * Converts workflows to linked data.
     * @param workflows The workflows which will be transformed to linked data.
     * @param connection The connection on which the workflows are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data entities.
     */
    public toTriples<T extends DGTWorkflow>(workflows: DGTWorkflow[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ workflows });
        this.logger.debug(DGTWorkflowTransformerService.name, 'Starting to transform to linked data', { workflows });

        const transformedworkflows = workflows.map<DGTWorkflow>(workflow => {

            const workflowSubject = {
                value: workflow.uri,
                termType: DGTLDTermType.REFERENCE,
            } as DGTLDNode;

            let newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://digita.ai/voc/workflows#workflow',
                    subject: { value: `${workflow.uri.split('#')[0]}#`, termType: DGTLDTermType.REFERENCE },
                    object: workflowSubject,
                },
                {
                    predicate: 'http://digita.ai/voc/workflows#source',
                    subject: workflowSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: workflow.source,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/workflows#destination',
                    subject: workflowSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: workflow.destination,
                    },
                },
            ];

            newTriples = newTriples.concat(this.filterToTriples(workflow, workflowSubject));
            newTriples = newTriples.concat(this.actionToTriples(workflow, workflowSubject));

            return {
                ...workflow,
                exchange: workflow.exchange,
                uri: workflow.uri,
                filter: workflow.filter,
                source: workflow.source,
                destination: workflow.destination,
                triples: newTriples,
            };
        });

        this.logger.debug(DGTWorkflowTransformerService.name, 'Transformed workflows to linked data', transformedworkflows);

        return of(transformedworkflows as T[]);
    }

    /**
     * Creates a single Connectortype from linked data.
     * @param triple The entity of the the Connectortype's subject.
     * @param workflow The entity to be transformed to an Connectortype.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed Connectortype.
     */
    private transformOne<T extends DGTWorkflow>(triple: DGTLDTriple, workflow: DGTLDResource): T {
        this.paramChecker.checkParametersNotNull({ triple, entity: workflow });

        const workflowTriples = workflow.triples.filter(value =>
            value.subject.value === triple.object.value);

        const filter = this.filterToDomain(triple, workflow);
        const actions = this.actionToDomain(triple, workflow)

        const source = workflowTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/workflows#source',
        );

        const destination = workflowTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/workflows#destination',
        );

        return {
            uri: triple.object.value,
            filter: filter,
            exchange: null,
            source: source ? source.object.value : null,
            destination: destination ? destination.object.value : null,
            actions,
            triples: null,
        } as T;
    }

    private filterToTriples(workflow: DGTWorkflow, workflowSubject: DGTLDNode): DGTLDTriple[] {
        let res = [];

        if (!workflow) {
            throw new DGTErrorArgument('Argument workflow should be set.', workflow);
        }

        if (!workflowSubject) {
            throw new DGTErrorArgument('Argument workflowSubject should be set.', workflowSubject);
        }

        if (!workflow.filter) {
            throw new DGTErrorArgument('Argumentworkflow.filter should be set.', workflow.filter);
        }

        if (workflow.filter.type !== DGTLDFilterType.BGP) {
            throw new DGTErrorArgument('Argument workflow filter type should be BGP.', workflow);
        }

        const filter: DGTLDFilterBGP = workflow.filter as any;

        res = [];

        filter.predicates?.forEach(predicate => {
            res.push({
                predicate: 'http://digita.ai/voc/workflowfilter#predicates',
                subject: workflowSubject,
                object: {
                    termType: DGTLDTermType.REFERENCE,
                    dataType: DGTLDDataType.STRING,
                    value: predicate,
                },
            });
        });

        return res;
    }

    private filterToDomain(triple: DGTLDTriple, workflow: DGTLDResource): DGTLDFilter {

        let filter: DGTLDFilter = null;

        if (!triple) {
            throw new DGTErrorArgument('Argument triple should be set.', triple);
        }

        if (!workflow) {
            throw new DGTErrorArgument('Argument workflow should be set.', workflow);
        }

        const predicates: string[] = workflow.triples.filter(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/workflowfilter#predicates',
        ).map(predicate => predicate.object.value);

        filter = {
            type: DGTLDFilterType.BGP,
            predicates,
        } as DGTLDFilterBGP;

        return filter;
    }

    private actionToTriples(workflow: DGTWorkflow, workflowSubject: DGTLDNode): DGTLDTriple[] {
        let res = [];

        if (!workflow) {
            throw new DGTErrorArgument('Argument workflow should be set.', workflow);
        }

        if (!workflowSubject) {
            throw new DGTErrorArgument('Argument workflowSubject should be set.', workflowSubject);
        }

        if (!workflow.actions) {
            throw new DGTErrorArgument('Argumentworkflow.actions should be set.', workflow.actions);
        }

        const actions: DGTWorkflowAction[] = workflow.actions as any;

        res = [];

        actions.forEach(action => {
            const subject = {
                value: `${workflow.uri.split('#')[0]}#` + uuid(),
                termType: DGTLDTermType.REFERENCE,
            };
            res.push({
                predicate: 'http://digita.ai/voc/workflow#actions',
                subject: workflowSubject,
                object: subject,
            });
            res.push({
                predicate: 'http://digita.ai/voc/workflow#actiontype',
                subject,
                object: {
                    termType: DGTLDTermType.LITERAL,
                    dataType: DGTLDDataType.STRING,
                    value: action.type,
                },
            });

            if (action.type === DGTWorkflowActionType.REMOVE_PREFIX) {
                const newAction = action as DGTRemovePrefixWorkflowAction;
                res.push({
                    predicate: 'http://digita.ai/voc/workflow#actionpredicate',
                    subject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: newAction.predicate,
                    },
                });
                res.push({
                    predicate: 'http://digita.ai/voc/workflow#actionprefix',
                    subject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: newAction.prefix,
                    },
                });
            } else if (action.type === DGTWorkflowActionType.MAP_FIELD) {
                const newAction = action as DGTMapFieldWorkflowAction;
                res.push({
                    predicate: 'http://digita.ai/voc/workflow#actionnewPredicate',
                    subject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: newAction.newPredicate,
                    },
                });
                res.push({
                    predicate: 'http://digita.ai/voc/workflow#actionoldPredicate',
                    subject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: newAction.oldPredicate,
                    },
                });
            }
        });

        return res;
    }

    private actionToDomain(triple: DGTLDTriple, workflow: DGTLDResource): any {

        if (!triple) {
            throw new DGTErrorArgument('Argument triple should be set.', triple);
        }

        if (!workflow) {
            throw new DGTErrorArgument('Argument workflow should be set.', workflow);
        }

        const actions = workflow.triples.filter(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/workflow#actions',
        ).map(action => {
            let res = {};
            const type = workflow.triples.find(value =>
                value.subject.value === action.object.value &&
                value.predicate === 'http://digita.ai/voc/workflow#actiontype',
            );

            res = { type: type ? type.object.value : null }

            if (type.object.value === DGTWorkflowActionType.REMOVE_PREFIX) {
                const predicate = workflow.triples.find(value =>
                    value.subject.value === action.object.value &&
                    value.predicate === 'http://digita.ai/voc/workflow#actionpredicate',
                );

                const prefix = workflow.triples.find(value =>
                    value.subject.value === action.object.value &&
                    value.predicate === 'http://digita.ai/voc/workflow#actionprefix',
                );

                res = {
                    ...res,
                    predicate: predicate ? predicate.object.value : null,
                    prefix: prefix ? prefix.object.value : null,
                }
            } else if (type.object.value === DGTWorkflowActionType.MAP_FIELD) {
                const oldpredicate = workflow.triples.find(value =>
                    value.subject.value === action.object.value &&
                    value.predicate === 'http://digita.ai/voc/workflow#actionoldPredicate',
                );

                const newpredicate = workflow.triples.find(value =>
                    value.subject.value === action.object.value &&
                    value.predicate === 'http://digita.ai/voc/workflow#actionnewPredicate',
                );

                res = {
                    ...res,
                    oldpredicate: oldpredicate ? oldpredicate.object.value : null,
                    newpredicate: newpredicate ? newpredicate.object.value : null,
                }
            }

            return res;
        });

        return actions;
    }
}
