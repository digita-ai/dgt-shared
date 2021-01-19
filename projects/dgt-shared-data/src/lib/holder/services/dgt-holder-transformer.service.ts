import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTHolder } from '../models/dgt-holder.model';

/** Transforms linked data to resources, and the other way around. */
@DGTInjectable()
export class DGTHolderTransformerService implements DGTLDTransformer<DGTHolder> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService,
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
                map(resourcesRes => _.flatten(resourcesRes)),
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
            const holderValues = resource.triples.filter(value =>
                value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
                value.object.value === 'http://digita.ai/voc/holders#holder',
            );

            if (holderValues) {
                res = holderValues.map(holderValue => this.transformOne(holderValue, resource));
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
                termType: DGTLDTermType.REFERENCE,
            };

            const triples = [
                {
                    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        value: 'http://digita.ai/voc/holders#holder',
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/holders#holder',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.uri,
                    },
                },
            ];

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples,
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
            uri: triple.subject.value,
            triples: null,
            exchange: resource.exchange,
        };
    }
}
