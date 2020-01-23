import { DGTWorkflowAction } from './dgt-workflow-action.model';
import { DGTLDField } from '../../linked-data/models/dgt-ld-field.model';

export interface DGTWorkflow {
    actions: DGTWorkflowAction[];
    fields: DGTLDField[];
    source: string;
}
