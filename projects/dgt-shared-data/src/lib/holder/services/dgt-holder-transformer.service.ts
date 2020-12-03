import { Observable, of, forkJoin } from 'rxjs';

import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTHolder } from '../models/dgt-holder.model';

/** Transforms linked data to resources, and the other way around. */
@DGTInjectable()
export class DGTHolderTransformerService implements DGTLDTransformer<DGTHolder> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) { }

    /**
     * Transforms multiple linked data resources to resources.
     * @param resources Linked data objects to be transformed to resources
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of resources
     */
    public toDomain(resources: DGTLDResource[]): Observable<DGTHolder[]> {
        this.paramChecker.checkParametersNotNull({ resources });

        return forkJoin(resources.map(resource => this.toDomainOne(resource)))
            .pipe(
                map(resourcesRes => _.flatten(resourcesRes))
            );
    }

    /**
     * Transformed a single linked data resource to resources.
     * @param resource The linked data resource to be transformed to resources.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of resources
     */
    private toDomainOne(resource: DGTLDResource): Observable<DGTHolder[]> {
        this.paramChecker.checkParametersNotNull({ resource });

        let res: DGTHolder[] = null;

        if (resource && resource.triples) {
            const resourceSubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://digita.ai/voc/holders#holder' &&
                value.subject.value.endsWith('holder#')
            );

            if (resourceSubjectValues) {
                res = resourceSubjectValues.map(resourceSubjectValue => this.transformOne(resourceSubjectValue, resource));
            }
        }

        this.logger.debug(DGTHolderTransformerService.name, 'Transformed values to resources', { resource, res });

        return of(res);
    }

    /**
     * Converts resources to linked data.
     * @param resources The resources which will be transformed to linked data.
     * @param connection The connection on which the resources are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data resources.
     */
    public toTriples(resources: DGTHolder[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ resources });
        this.logger.debug(DGTHolderTransformerService.name, 'Starting to transform to linked data', { resources });

        const transformedResources = resources.map<DGTLDResource>(resource => {
            const resourceSubject = {
                value: resource.uri,
                termType: DGTLDTermType.REFERENCE
            };

            const triples = [
                {
                    predicate: 'http://digita.ai/voc/holders#holder',
                    subject: { value: `${resource.uri.split('#')[0]}#`, termType: DGTLDTermType.REFERENCE },
                    object: resourceSubject,
                }
            ];

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples
            };
        });

        this.logger.debug(DGTHolderTransformerService.name, 'Transformed resources to linked data', { resources });

        return of(transformedResources);
    }

    /**
     * Creates a single resource from linked data.
     * @param resourceSubjectValue The resource of the the resource's subject.
     * @param resource\ The resource to be transformed to an resource.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed resource.
     */
    private transformOne(triple: DGTLDTriple, resource: DGTLDResource): DGTHolder {
        this.paramChecker.checkParametersNotNull({ triple, resource });

        return {
            uri: triple.object.value,
            triples: null,
            exchange: resource.exchange,
        };
    }
}
