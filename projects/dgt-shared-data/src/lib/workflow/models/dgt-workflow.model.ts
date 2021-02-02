import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTWorkflowAction } from './dgt-workflow-action.model';

export interface DGTWorkflow extends DGTLDResource {
    description: string;
    label: string;
    icon: string;
    actions: DGTWorkflowAction[];
    source: string;
    destination?: string;
}
