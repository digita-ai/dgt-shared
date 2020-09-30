import { DGTWorkflowAction } from './dgt-workflow-action.model';

export interface DGTWorkflow {
    actions: DGTWorkflowAction[];
    predicates: string[];
    source: string;
}
