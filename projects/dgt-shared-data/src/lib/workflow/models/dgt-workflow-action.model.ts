import { Observable } from 'rxjs';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTWorkflowActionType } from './dgt-workflow-action-type.model';

export interface DGTWorkflowAction {
    type: DGTWorkflowActionType;
    execute(resources: DGTLDResource[]): Observable<DGTLDResource[]>;
}
