import { DGTWorkflowAction } from '../models/dgt-workflow-action.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTWorkflowActionType } from '../models/dgt-workflow-action-type.model';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTLDPredicate } from '../../linked-data/models/dgt-ld-predicate.model';

export class DGTMapFieldWorkflowAction implements DGTWorkflowAction {
    public type = DGTWorkflowActionType.REMOVE_PREFIX;

    constructor(private newField: DGTLDPredicate, private logger: DGTLoggerService) { }

    public execute(value: DGTLDTriple): DGTLDTriple {
        this.logger.debug(DGTMapFieldWorkflowAction.name, 'Executing map field action', { newField: this.newField, value });

        if (value && value.predicate && this.newField) {
            value.predicate = this.newField;
        }

        return value;
    }
}
