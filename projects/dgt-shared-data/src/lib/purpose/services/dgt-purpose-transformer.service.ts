import { Observable, of, forkJoin } from 'rxjs';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTPurpose } from '../models/dgt-purpose.model';

/** Transforms linked data to resources, and the other way around. */
@DGTInjectable()
export class DGTPurposeTransformerService implements DGTLDTransformer<DGTPurpose> {

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
    public toDomain(resources: DGTLDResource[]): Observable<DGTPurpose[]> {
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
    private toDomainOne(resource: DGTLDResource): Observable<DGTPurpose[]> {
        this.paramChecker.checkParametersNotNull({ resource });

        let res: DGTPurpose[] = null;

        if (resource && resource.triples) {
            const resourceSubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
                value.object.value === 'http://digita.ai/voc/purposes#purpose'
            );

            if (resourceSubjectValues) {
                res = resourceSubjectValues.map(resourceSubjectValue => this.transformOne(resourceSubjectValue, resource));
            }
        }

        this.logger.debug(DGTPurposeTransformerService.name, 'Transformed values to resources', { resource, res });

        return of(res);
    }

    /**
     * Converts resources to linked data.
     * @param resources The resources which will be transformed to linked data.
     * @param connection The connection on which the resources are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data resources.
     */
    public toTriples(resources: DGTPurpose[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ resources });
        this.logger.debug(DGTPurposeTransformerService.name, 'Starting to transform to linked data', { resources });

        const transformedResources = resources.map<DGTLDResource>(resource => {

            const resourceSubject = {
                value: resource.uri,
                termType: DGTLDTermType.REFERENCE
            };

            const newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                    subject: resourceSubject,
                    object: { value: 'http://digita.ai/voc/purposes#purpose', termType: DGTLDTermType.REFERENCE },
                },
                {
                    predicate: 'http://digita.ai/voc/purposes#icon',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.icon
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/purposes#description',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.description
                    },
                },
            ];

            // add predicates array
            resource.predicates.forEach( predicate => {
                newTriples.push({
                    predicate: 'http://digita.ai/voc/purposes#predicate',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: predicate
                    },
                });
            });

            // Optional parameters
            if (resource.label) {
                newTriples.push({
                    predicate: 'http://digita.ai/voc/purposes#label',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.label
                    },
                });
            }
            if (resource.aclNeeded && resource.aclNeeded.length > 0) {
                resource.aclNeeded.forEach( acl => {
                    newTriples.push({
                        predicate: 'http://digita.ai/voc/purposes#aclneeded',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.LITERAL,
                            dataType: DGTLDDataType.STRING,
                            value: acl
                        },
                    });
                });
            }

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples: newTriples
            };
        });

        this.logger.debug(DGTPurposeTransformerService.name, 'Transformed resources to linked data', transformedResources);

        return of(transformedResources);
    }

    /**
     * Creates a single resource from linked data.
     * @param triple The resource of the the resource's subject.
     * @param resource\ The resource to be transformed to an resource.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed resource.
     */
    private transformOne(triple: DGTLDTriple, resource: DGTLDResource): DGTPurpose {
        this.paramChecker.checkParametersNotNull({ resourceSubjectValue: triple, resource });

        const icon = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/purposes#icon'
        );
        const description = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/purposes#description'
        );
        const label = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/purposes#label'
        );
        const predicates = resource.triples.filter(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/purposes#predicate'
        );
        const aclNeeded = resource.triples.filter(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/purposes#aclneeded'
        );

        return {
            uri: resource.uri,
            triples: [...resource.triples],
            exchange: resource.exchange,
            icon: icon ? icon.object.value : null,
            description: description ? description.object.value : null,
            label: label ? label.object.value : null,
            predicates: predicates && predicates.length > 0 ? predicates.map( p => p.object.value) : null,
            aclNeeded: aclNeeded && aclNeeded.length > 0 ? aclNeeded.map( a => a.object.value) : null,
        };
    }
}
