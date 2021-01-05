import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTWorkflow } from '../models/dgt-workflow.model';

@DGTInjectable()
export abstract class DGTWorkflowService implements DGTLDResourceService<DGTWorkflow> {
    public abstract get(id: string): Observable<DGTWorkflow>;
    public abstract query(filter?: DGTLDFilter): Observable<DGTWorkflow[]>;
    public abstract save<T extends DGTWorkflow>(resources: T[]): Observable<T[]>;
    public abstract delete(resource: DGTWorkflow): Observable<DGTWorkflow>;
}
