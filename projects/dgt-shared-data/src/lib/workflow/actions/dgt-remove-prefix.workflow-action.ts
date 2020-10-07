import { DGTWorkflowAction } from '../models/dgt-workflow-action.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTWorkflowActionType } from '../models/dgt-workflow-action-type.model';
import { DGTLoggerService } from '@digita-ai/dgt-shared-utils';

export class DGTRemovePrefixWorkflowAction implements DGTWorkflowAction {
    public type = DGTWorkflowActionType.REMOVE_PREFIX;

    constructor(private prefix: string, private logger: DGTLoggerService) { }

    public execute(value: DGTLDTriple): DGTLDTriple {
        this.logger.debug(DGTRemovePrefixWorkflowAction.name, 'Executing remove prefix action', { prefix: this.prefix, value });

        if (value && value.object) {
            value.object = value.object.value.replace(this.prefix, '');
        }

        return value;
    }
}
