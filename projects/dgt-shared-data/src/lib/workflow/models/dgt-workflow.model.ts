import { DGTWorkflowAction } from './dgt-workflow-action.model';
import { DGTWorkflowTrigger } from './dgt-workflow-trigger.model';

export interface DGTWorkflow {
    actions: DGTWorkflowAction[];
    trigger: DGTWorkflowTrigger;
}
