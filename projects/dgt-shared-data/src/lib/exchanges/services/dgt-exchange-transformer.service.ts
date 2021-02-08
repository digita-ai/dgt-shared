import { DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTExchange } from '../models/dgt-exchange.model';

/** Transforms linked data to resources, and the other way around. */
@DGTInjectable()
export class DGTExchangeTransformerService implements DGTLDTransformer<DGTExchange> {
    constructor(private paramChecker: DGTParameterCheckerService) {}

    /**
     * Transforms multiple linked data resources to resources.
     * @param resources Linked data objects to be transformed to resources
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of resources
     */
    public toDomain(resources: DGTLDResource[]): Observable<DGTExchange[]> {
        this.paramChecker.checkParametersNotNull({ resources });

        return forkJoin(resources.map((resource) => this.toDomainOne(resource))).pipe(map((res) => _.flatten(res)));
    }

    /**
     * Transformed a single linked data resource to resources.
     * @param resource The linked data resource to be transformed to resources.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of resources
     */
    private toDomainOne(resource: DGTLDResource): Observable<DGTExchange[]> {
        this.paramChecker.checkParametersNotNull({ resource });

        let res: DGTExchange[] = null;

        if (resource && resource.triples) {
            const exchangeValues = resource.triples.filter(
                (value) =>
                    value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
                    value.object.value === 'http://digita.ai/voc/exchanges#exchange',
            );

            if (exchangeValues) {
                res = exchangeValues.map((exchangeValue) => this.transformOne(exchangeValue, resource));
            }
        }

        return of(res);
    }

    /**
     * Converts resources to linked data.
     * @param resources The resources which will be transformed to linked data.
     * @param connection The connection on which the resources are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data resources.
     */
    public toTriples(resources: DGTExchange[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ resources });

        const transformedResources = resources.map<DGTLDResource>((resource) => {
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
                        value: 'http://digita.ai/voc/exchanges#exchange',
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/exchanges#purpose',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.purpose,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/exchanges#holder',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.holder,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/exchanges#source',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.source,
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/exchanges#connection',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.connection,
                    },
                },
            ];

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples: newTriples,
            };
        });

        return of(transformedResources);
    }

    /**
     * Creates a single resource from linked data.
     * @param triple The resource of the the resource's subject.
     * @param resource\ The resource to be transformed to an resource.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed resource.
     */
    private transformOne(triple: DGTLDTriple, resource: DGTLDResource): DGTExchange {
        this.paramChecker.checkParametersNotNull({ resourceSubjectValue: triple, resource });

        const resourceTriples = resource.triples.filter((value) => value.subject.value === triple.subject.value);

        const purpose = resourceTriples.find((value) => value.predicate === 'http://digita.ai/voc/exchanges#purpose');
        const holder = resourceTriples.find((value) => value.predicate === 'http://digita.ai/voc/exchanges#holder');
        const source = resourceTriples.find((value) => value.predicate === 'http://digita.ai/voc/exchanges#source');
        const connection = resourceTriples.find(
            (value) => value.predicate === 'http://digita.ai/voc/exchanges#connection',
        );

        return {
            uri: triple.subject.value,
            triples: null,
            exchange: null,
            purpose: purpose ? purpose.object.value : null,
            holder: holder ? holder.object.value : null,
            source: source ? source.object.value : null,
            connection: connection ? connection.object.value : null,
        };
    }
}
