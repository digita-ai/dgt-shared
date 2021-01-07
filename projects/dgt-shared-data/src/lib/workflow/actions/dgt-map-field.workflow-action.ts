import { DGTErrorArgument, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTWorkflowActionType } from '../models/dgt-workflow-action-type.model';
import { DGTWorkflowAction } from '../models/dgt-workflow-action.model';

export class DGTMapFieldWorkflowAction implements DGTWorkflowAction {
    public type = DGTWorkflowActionType.MAP_FIELD;

    constructor(public oldPredicate: string, public newPredicate: string, private logger: DGTLoggerService) { }

    public execute(resources: DGTLDResource[]): Observable<DGTLDResource[]> {
        this.logger.debug(DGTMapFieldWorkflowAction.name, 'Executing map field action', { oldPredicate: this.oldPredicate, newPredicate: this.newPredicate, resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        const res = resources.map(resource => {
            const updatedResource = { ...resource };

            updatedResource.triples = updatedResource.triples.map(triple => {
                const updatedTriple = { ...triple };

                if (updatedTriple && updatedTriple.predicate === this.oldPredicate && this.newPredicate) {
                    updatedTriple.predicate = this.newPredicate;
                }

                return updatedTriple;
            });

            return updatedResource;
        });

        return of(res);
    }
}
