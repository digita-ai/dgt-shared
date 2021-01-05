import { DGTLDResource } from '@digita-ai/dgt-shared-data/public-api';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTWorkflowAction } from './dgt-workflow-action.model';

export interface DGTWorkflow extends DGTLDResource {
    actions: DGTWorkflowAction[];
    filter: DGTLDFilter;
    source: string;
    destination?: string;
}
