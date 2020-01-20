import { DGTWorkflowAction } from '../models/dgt-workflow-action.model';
import { DGTLDValue } from '../../linked-data/models/dgt-ld-value.model';
import { DGTWorkflowActionType } from '../models/dgt-workflow-action-type.model';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTLDField } from '../../linked-data/models/dgt-ld-field.model';

export class DGTMapFieldWorkflowAction implements DGTWorkflowAction {
    public type = DGTWorkflowActionType.REMOVE_PREFIX;

    constructor(private newField: DGTLDField, private logger: DGTLoggerService) { }

    public execute(value: DGTLDValue): DGTLDValue {
        this.logger.debug(DGTMapFieldWorkflowAction.name, 'Executing map field action', { newField: this.newField, value });

        if (value && value.field && this.newField) {
            value.field = this.newField;
        }

        return value;
    }
}
