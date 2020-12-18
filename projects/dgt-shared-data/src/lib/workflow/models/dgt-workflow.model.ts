import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTWorkflowAction } from './dgt-workflow-action.model';

export interface DGTWorkflow {
    actions: DGTWorkflowAction[];
    filter: DGTLDFilter;
    source: string;
    destination?: string;
}
