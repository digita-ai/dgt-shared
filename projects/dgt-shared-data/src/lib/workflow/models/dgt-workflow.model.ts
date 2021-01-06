import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTWorkflowAction } from './dgt-workflow-action.model';

export interface DGTWorkflow extends DGTLDResource {
    description: string;
    label: string;
    icon: string;
    actions: DGTWorkflowAction[];
    filter: DGTLDFilter;
    source: string;
    destination?: string;
}
