import { Observable, of, forkJoin } from 'rxjs';
import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTExchange } from '../models/dgt-exchange.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';

/** Transforms linked data to resources, and the other way around. */
@DGTInjectable()
export class DGTExchangeTransformerService implements DGTLDTransformer<DGTExchange> {

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
    public toDomain(resources: DGTLDResource[]): Observable<DGTExchange[]> {
        this.paramChecker.checkParametersNotNull({ resources: resources });

        return forkJoin(resources.map(resource => this.toDomainOne(resource)))
            .pipe(
                map(resources => _.flatten(resources))
            );
    }

    /**
     * Transformed a single linked data resource to resources.
     * @param resource The linked data resource to be transformed to resources.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of resources
     */
    private toDomainOne(resource: DGTLDResource): Observable<DGTExchange[]> {
        this.paramChecker.checkParametersNotNull({ resource: resource });

        let res: DGTExchange[] = null;

        if (resource && resource.triples) {
            const resourceSubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://digita.ai/voc/exchanges#exchange'
            );

            if (resourceSubjectValues) {
                res = resourceSubjectValues.map(resourceSubjectValue => this.transformOne(resourceSubjectValue, resource));
            }
        }

        this.logger.debug(DGTExchangeTransformerService.name, 'Transformed values to resources', { resource: resource, res });

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
        this.paramChecker.checkParametersNotNull({ resources: resources });
        this.logger.debug(DGTExchangeTransformerService.name, 'Starting to transform to linked data', { resources: resources });

        const transformedResources = resources.map<DGTLDResource>(resource => {
            const documentSubject = {
                value: '#',
                termType: DGTLDTermType.REFERENCE
            };

            const resourceSubject = {
                value: resource.uri,
                termType: DGTLDTermType.REFERENCE
            };

            const newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://digita.ai/voc/exchanges#purpose',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.purpose
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/exchanges#holder',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.holder
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/exchanges#source',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.source
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/exchanges#connection',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: resource.connection
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/exchanges#exchange',
                    subject: documentSubject,
                    object: resourceSubject,
                }
            ];

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples: newTriples
            };
        });

        this.logger.debug(DGTExchangeTransformerService.name, 'Transformed resources to linked data', transformedResources);

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
        this.paramChecker.checkParametersNotNull({ resourceSubjectValue: triple, resource: resource });

        const purpose = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/exchanges#purpose'
        );
        const holder = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/exchanges#holder'
        );
        const source = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/exchanges#source'
        );
        const connection = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/exchanges#connection'
        );

        return {
            uri: resource.uri,
            triples: [...resource.triples],
            exchange: resource.exchange,
            purpose: purpose ? purpose.object.value : null,
            holder: holder ? holder.object.value : null,
            source: source ? source.object.value : null,
            connection: connection ? connection.object.value : null,
        };
    }
}
