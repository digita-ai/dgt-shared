import { Observable, of } from 'rxjs';

import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

/** Transforms linked data to events, and the other way around. */
@DGTInjectable()
export class DGTLDResourceTransformerService implements DGTLDTransformer<DGTLDResource> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) { }

    /**
     * Transforms multiple linked data entities to events.
     * @param resources Linked data objects to be transformed to events
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of events
     */
    public toDomain(resources: DGTLDResource[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ resources });

        return of(resources);
    }

    public toTriples(resources: DGTLDResource[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ resources });
        this.logger.debug(DGTLDResourceTransformerService.name, 'Starting to transform to linked data', { resources });

        return of(resources);
    }
}
