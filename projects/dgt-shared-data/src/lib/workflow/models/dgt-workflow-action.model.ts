import { DGTWorkflowActionType } from './dgt-workflow-action-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable } from 'rxjs';

export interface DGTWorkflowAction {
    type: DGTWorkflowActionType;
    execute(values: DGTLDTriple): Observable<DGTLDTriple>;
}
