import { DGTWorkflowAction } from '../models/dgt-workflow-action.model';
import { DGTWorkflowActionType } from '../models/dgt-workflow-action-type.model';
import { DGTErrorArgument, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

export class DGTRemovePrefixWorkflowAction implements DGTWorkflowAction {
    public type = DGTWorkflowActionType.REMOVE_PREFIX;

    constructor(private predicate: string, private prefix: string, private logger: DGTLoggerService) { }

    public execute(resources: DGTLDResource[]): Observable<DGTLDResource[]> {
        this.logger.debug(DGTRemovePrefixWorkflowAction.name, 'Executing remove prefix action', { predicate: this.predicate, prefix: this.prefix, resources });

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        const res = resources.map(resource => {
            const updatedResource = { ...resource };

            updatedResource.triples = updatedResource.triples.map(triple => {
                const updatedTriple = { ...triple };

                if (updatedTriple && updatedTriple.object) {
                    let temp = updatedTriple.object.value;
                    let wasNumber = false;
                    if (typeof temp === 'number') {
                        temp = temp.toString();
                        wasNumber = true;
                    }
                    if (temp.startsWith(this.prefix)) {
                        updatedTriple.object.value = temp.replace(this.prefix, '');
                    }
                    if (wasNumber) {
                        updatedTriple.object.value = Number(updatedTriple.object.value);
                    }
                }

                return updatedTriple;
            });

            return updatedResource;
        });

        return of(res);
    }
}
