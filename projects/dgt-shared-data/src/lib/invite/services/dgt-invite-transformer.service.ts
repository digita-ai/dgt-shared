    import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTInvite } from '../models/dgt-invite.model';

/** Transforms linked data to resources, and the other way around. */
@DGTInjectable()
export class DGTInviteTransformerService implements DGTLDTransformer<DGTInvite> {

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
    public toDomain(resources: DGTLDResource[]): Observable<DGTInvite[]> {
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
    private toDomainOne(resource: DGTLDResource): Observable<DGTInvite[]> {
        this.paramChecker.checkParametersNotNull({ resource });

        let res: DGTInvite[] = null;

        if (resource && resource.triples) {
            const inviteValues = resource.triples.filter(value =>
                value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
                value.object.value === 'http://digita.ai/voc/invites#invite',
            );

            if (inviteValues) {
                res = inviteValues.map(inviteValue => this.transformOne(inviteValue, resource));
            }
        }

        this.logger.debug(DGTInviteTransformerService.name, 'Transformed values to resources', { resource, res });

        return of(res);
    }

    /**
     * Converts resources to linked data.
     * @param resources The resources which will be transformed to linked data.
     * @param connection The connection on which the resources are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data resources.
     */
    public toTriples(resources: DGTInvite[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ resources });
        this.logger.debug(DGTInviteTransformerService.name, 'Starting to transform to linked data', { resources });

        const transformedResources = resources.map<DGTLDResource>(resource => {

            const resourceSubject = {
                value: resource.uri,
                termType: DGTLDTermType.REFERENCE,
            };

            const newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: 'http://digita.ai/voc/invites#invite',
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/invites#holder',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.holder,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/invites#state',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.state,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/invites#purpose',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.purpose,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/invites#created',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.created,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/invites#expires',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.expires,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/invites#accepted',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.accepted,
                    },
                },
            ];

            if (resource.connection) {
                newTriples.push({
                    predicate: 'http://digita.ai/voc/invites#connection',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.connection,
                    },
                });
            }

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples: newTriples,
            };
        });

        this.logger.debug(DGTInviteTransformerService.name, 'Transformed resources to linked data', transformedResources);

        return of(transformedResources);
    }

    /**
     * Creates a single resource from linked data.
     * @param triple The resource of the the resource's subject.
     * @param resource\ The resource to be transformed to an resource.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed resource.
     */
    private transformOne(triple: DGTLDTriple, resource: DGTLDResource): DGTInvite {
        this.paramChecker.checkParametersNotNull({ resourceSubjectValue: triple, resource });

        const resourceTriples = resource.triples.filter(value =>
            value.subject.value === triple.subject.value);

        const holder = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/invites#holder',
        );
        const state = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/invites#state',
        );
        const purpose = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/invites#purpose',
        );
        const connection = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/invites#connection',
        );
        const created = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/invites#created',
        );
        const expires = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/invites#expires',
        );
        const accepted = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/invites#accepted',
        );

        return {
            uri: triple.subject.value,
            triples: null,
            exchange: null,
            holder: holder ? holder.object.value : null,
            state: state ? state.object.value : null,
            purpose: purpose ? purpose.object.value : null,
            connection: connection ? connection.object.value : null,
            created: created ? created.object.value : null,
            expires: expires ? expires.object.value : null,
            accepted: accepted ? accepted.object.value : null,
        };
    }
}
