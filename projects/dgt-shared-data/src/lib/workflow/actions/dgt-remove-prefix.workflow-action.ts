import { DGTWorkflowAction } from '../models/dgt-workflow-action.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';
import { DGTWorkflowActionType } from '../models/dgt-workflow-action-type.model';
import { DGTLoggerService } from '@digita/dgt-shared-utils';

export class DGTRemovePrefixWorkflowAction implements DGTWorkflowAction {
    public type = DGTWorkflowActionType.REMOVE_PREFIX;

    constructor(private prefix: string, private logger: DGTLoggerService) { }

    public execute(value: DGTLDValue): DGTLDValue {
        this.logger.debug(DGTRemovePrefixWorkflowAction.name, 'Executing remove prefix action', { prefix: this.prefix, value });

        if (value && value.value && typeof value.value === 'string') {
            value.value = value.value.replace(this.prefix, '');
        }

        return value;
    }
}
