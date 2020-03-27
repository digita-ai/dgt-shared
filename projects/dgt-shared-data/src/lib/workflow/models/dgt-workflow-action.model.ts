import { DGTWorkflowActionType } from './dgt-workflow-action-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';

export interface DGTWorkflowAction {
    type: DGTWorkflowActionType;
    execute(values: DGTLDTriple): DGTLDTriple;
}
