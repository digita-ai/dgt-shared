import { Observable, of, forkJoin } from 'rxjs';

import { DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTConnectorType } from '../models/dgt-connector-type.model';
import { DGTLDNode } from '../../linked-data/models/dgt-ld-node.model';

/** Transforms linked data to connectortypes, and the other way around. */
@DGTInjectable()
export class DGTConnectorTypeTransformerService implements DGTLDTransformer<DGTConnectorType> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) { }

    /**
     * Transforms multiple linked data entities to connectortypes.
     * @param resources Linked data objects to be transformed to connectortypes
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of connectortypes
     */
    public toDomain<T extends DGTConnectorType>(resources: DGTLDResource[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entities: resources });

        return forkJoin(resources.map(entity => this.toDomainOne<T>(entity)))
            .pipe(
                map(connectortypes => _.flatten(connectortypes))
            );
    }

    /**
     * Transformed a single linked data entity to connectortypes.
     * @param resource The linked data entity to be transformed to connectortypes.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of connectortypes
     */
    private toDomainOne<T extends DGTConnectorType>(resource: DGTLDResource): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entity: resource });

        let res: DGTConnectorType[] = null;

        if (resource && resource.triples) {
            const connectortypesubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://digita.ai/voc/connectortypes#connectortype' &&
                value.subject.value.endsWith('connectortype#')
            );

            if (connectortypesubjectValues) {
                res = connectortypesubjectValues.map(connectortypesubjectValue => this.transformOne(connectortypesubjectValue, resource));
            }
        }

        this.logger.debug(DGTConnectorTypeTransformerService.name, 'Transformed values to connectortypes', { entity: resource, res });

        return of(res as T[]);
    }

    /**
     * Converts connectortypes to linked data.
     * @param connectortypes The connectortypes which will be transformed to linked data.
     * @param connection The connection on which the connectortypes are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data entities.
     */
    public toTriples<T extends DGTConnectorType>(connectortypes: DGTConnectorType[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ connectortypes });
        this.logger.debug(DGTConnectorTypeTransformerService.name, 'Starting to transform to linked data', { connectortypes });

        const transformedconnectortypes = connectortypes.map<DGTConnectorType>(resource => {

            const resourceSubject = {
                value: resource.uri,
                termType: DGTLDTermType.REFERENCE
            } as DGTLDNode;

            const newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://digita.ai/voc/connectortypes#connectortype',
                    subject: { value: `${resource.uri.split('#')[0]}#`, termType: DGTLDTermType.REFERENCE },
                    object: resourceSubject,
                },
                {
                    predicate: 'http://digita.ai/voc/connectortypes#description',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.description
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectortypes#group',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.group
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectortypes#label',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.label
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/connectortypes#icon',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.icon
                    },
                },
            ];

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                icon: resource.icon,
                group: resource.group,
                label: resource.label,
                triples: newTriples
            };
        });

        this.logger.debug(DGTConnectorTypeTransformerService.name, 'Transformed connectortypes to linked data', transformedconnectortypes);

        return of(transformedconnectortypes as T[]);
    }

    /**
     * Creates a single Connectortype from linked data.
     * @param triple The entity of the the Connectortype's subject.
     * @param resource The entity to be transformed to an Connectortype.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed Connectortype.
     */
    private transformOne<T extends DGTConnectorType>(triple: DGTLDTriple, resource: DGTLDResource): T {
        this.paramChecker.checkParametersNotNull({ triple, entity: resource });

        const resourceTriples = resource.triples.filter(value =>
            value.subject.value === triple.object.value);

        const description = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/connectortypes#description'
        );

        const group = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/connectortypes#group'
        );

        const label = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/connectortypes#label'
        );

        const icon = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/connectortypes#icon'
        );

        return {
            uri: triple.object.value,
            description: description ? description.object.value : null,
            exchange: null,
            group: group ? group.object.value : null,
            icon: icon ? icon.object.value : null,
            label: label ? label.object.value : null,
            triples: null,
        } as T;
    }
}
