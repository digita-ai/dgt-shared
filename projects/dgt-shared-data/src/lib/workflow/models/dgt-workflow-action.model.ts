import { DGTWorkflowActionType } from './dgt-workflow-action-type.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';

export interface DGTWorkflowAction {
    type: DGTWorkflowActionType;
    execute(values: DGTLDValue[]): DGTLDValue[];
}
