import { forkJoin, Observable, of } from 'rxjs';

import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDNode } from '../../linked-data/models/dgt-ld-node.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTSecurityPolicyAdmin } from '../models/dgt-security-policy-admin.model';
import { DGTSecurityPolicyAllowPurpose } from '../models/dgt-security-policy-allow-purpose.model';
import { DGTSecurityPolicyType } from '../models/dgt-security-policy-type.model';
import { DGTSecurityPolicy } from '../models/dgt-security-policy.model';

/** Transforms linked data to policies, and the other way around. */
@DGTInjectable()
export class DGTSecurityPolicyTransformerService implements DGTLDTransformer<DGTSecurityPolicy> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService,
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
                map(policies => _.flatten(policies)),
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
                value.predicate === 'http://digita.ai/voc/policies#policy' &&
                value.subject.value.endsWith('policy#'),
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

        const transformedPolicies = policies.map<DGTSecurityPolicy>(resource => {

            const resourceSubject = {
                value: resource.uri,
                termType: DGTLDTermType.REFERENCE,
            } as DGTLDNode;

            let newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://digita.ai/voc/policies#policy',
                    subject: { value: `${resource.uri.split('#')[0]}#`, termType: DGTLDTermType.REFERENCE },
                    object: resourceSubject,
                },
                {
                    predicate: 'http://digita.ai/voc/policies#holder',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.holder,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/policies#type',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.type,
                    },
                },
            ];

            if (resource.type === DGTSecurityPolicyType.ALLOW_PURPOSE) {
                newTriples = [
                    ...newTriples,
                    {
                        predicate: 'http://digita.ai/voc/policies#purpose',
                        subject: resourceSubject,
                        object: {
                            termType: DGTLDTermType.REFERENCE,
                            dataType: DGTLDDataType.STRING,
                            value: (resource as DGTSecurityPolicyAllowPurpose).purpose,
                        },
                    } ]
            }

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples: newTriples,
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

        const resourceTriples = resource.triples.filter(value =>
            value.subject.value === triple.object.value);

        const type = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/policies#type',
        );

        const holder = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/policies#holder',
        );

        const purpose = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/policies#purpose',
        );

        let res: DGTSecurityPolicy = null;
        const parsedType = type ? type.object.value : null;

        if (parsedType === DGTSecurityPolicyType.ALLOW_PURPOSE) {
            res = {
                uri: triple.object.value,
                holder: holder ? holder.object.value : null,
                purpose: purpose ? purpose.object.value : null,
                type: parsedType,
                triples: [...resourceTriples, triple],
                exchange: null,
            } as DGTSecurityPolicyAllowPurpose;
        } else if (parsedType === DGTSecurityPolicyType.ADMIN) {
            res = {
                uri: triple.object.value,
                holder: holder ? holder.object.value : null,
                type: parsedType,
                triples: [...resourceTriples, triple],
                exchange: null,
            } as DGTSecurityPolicyAdmin;
        }

        return res as T;
    }
}
