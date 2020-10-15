import { DGTWorkflowAction } from '../models/dgt-workflow-action.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTWorkflowActionType } from '../models/dgt-workflow-action-type.model';
import { DGTErrorArgument, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';

export class DGTMapFieldWorkflowAction implements DGTWorkflowAction {
    public type = DGTWorkflowActionType.REMOVE_PREFIX;

    constructor(private newField: string, private logger: DGTLoggerService) { }

    public execute(triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTMapFieldWorkflowAction.name, 'Executing map field action', { newField: this.newField, triples });

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }

        const res = triples.map(triple => {
            const updatedTriple = triple;

            if (updatedTriple && updatedTriple.predicate && this.newField) {
                updatedTriple.predicate = this.newField;
            }

            return updatedTriple;
        });

        return of(res);
    }
}
