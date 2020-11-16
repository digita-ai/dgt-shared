import { Observable, of, forkJoin } from 'rxjs';

import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTSecurityPolicy } from '../models/dgt-security-policy.model';

/** Transforms linked data to policies, and the other way around. */
@DGTInjectable()
export class DGTSecurityPolicyTransformerService implements DGTLDTransformer<DGTSecurityPolicy> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) { }

    /**
     * Transforms multiple linked data entities to policies.
     * @param resources Linked data objects to be transformed to policies
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of policies
     */
    public toDomain<T extends DGTSecurityPolicy>(resources: DGTLDResource[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entities: resources });

        return forkJoin(resources.map(entity => this.toDomainOne<T>(entity)))
            .pipe(
                map(policies => _.flatten(policies))
            );
    }

    /**
     * Transformed a single linked data entity to policies.
     * @param resource The linked data entity to be transformed to policies.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of policies
     */
    private toDomainOne<T extends DGTSecurityPolicy>(resource: DGTLDResource): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entity: resource });

        let res: DGTSecurityPolicy[] = null;

        if (resource && resource.triples) {
            const policiesubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://digita.ai/voc/policies#policy'
            );

            if (policiesubjectValues) {
                res = policiesubjectValues.map(policiesubjectValue => this.transformOne(policiesubjectValue, resource));
            }
        }

        this.logger.debug(DGTSecurityPolicyTransformerService.name, 'Transformed values to policies', { entity: resource, res });

        return of(res as T[]);
    }

    /**
     * Converts policies to linked data.
     * @param policies The policies which will be transformed to linked data.
     * @param connection The connection on which the policies are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data entities.
     */
    public toTriples<T extends DGTSecurityPolicy>(policies: DGTSecurityPolicy[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ policies });
        this.logger.debug(DGTSecurityPolicyTransformerService.name, 'Starting to transform to linked data', { policies });

        const transformedPolicies = policies.map<DGTSecurityPolicy>(policy => {
            const documentSubject = {
                value: '#',
                termType: DGTLDTermType.REFERENCE
            };

            const policiesubject = {
                value: policy.uri,
                termType: DGTLDTermType.REFERENCE
            };

            const newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://digita.ai/voc/policies#holder',
                    subject: policiesubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: policy.holder
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/policies#type',
                    subject: policiesubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: policy.type
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/policies#policy',
                    subject: documentSubject,
                    object: policiesubject,
                }
            ];

            return {
                ...policy,
                exchange: policy.exchange,
                uri: policy.uri,
                triples: newTriples
            };
        });

        this.logger.debug(DGTSecurityPolicyTransformerService.name, 'Transformed policies to linked data', transformedPolicies);

        return of(transformedPolicies as T[]);
    }

    /**
     * Creates a single policy from linked data.
     * @param triple The entity of the the policy's subject.
     * @param resource\ The entity to be transformed to an policy.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed policy.
     */
    private transformOne<T extends DGTSecurityPolicy>(triple: DGTLDTriple, resource: DGTLDResource): T {
        this.paramChecker.checkParametersNotNull({ triple, entity: resource });

        const type = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/policies#type'
        );

        const holder = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/policies#holder'
        );

        return {
            uri: resource.uri,
            holder: holder ? holder.object.value : null,
            type: type ? type.object.value : null,
            triples: [...resource.triples],
            exchange: resource.exchange,
        } as T;
    }
}
