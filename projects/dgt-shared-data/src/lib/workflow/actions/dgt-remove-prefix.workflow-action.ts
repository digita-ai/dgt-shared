import { DGTWorkflowAction } from '../models/dgt-workflow-action.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTWorkflowActionType } from '../models/dgt-workflow-action-type.model';
import { DGTErrorArgument, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';

export class DGTRemovePrefixWorkflowAction implements DGTWorkflowAction {
    public type = DGTWorkflowActionType.REMOVE_PREFIX;

    constructor(private prefix: string, private logger: DGTLoggerService) { }

    public execute(triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTRemovePrefixWorkflowAction.name, 'Executing remove prefix action', { prefix: this.prefix, triples });

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }

        const res = triples.map(triple => {
            const updatedTriple = triple;

            if (updatedTriple && updatedTriple.object) {
                let temp = updatedTriple.object.value;
                let wasNumber = false;
                if ( typeof temp === 'number') {
                    temp = temp.toString();
                    wasNumber = true;
                }
                if ( temp.startsWith(this.prefix) ) {
                    updatedTriple.object.value = temp.replace(this.prefix, '');
                }
                if ( wasNumber ) {
                    updatedTriple.object.value = Number(updatedTriple.object.value);
                }
            }

            return updatedTriple;
        });

        return of(res);
    }
}
