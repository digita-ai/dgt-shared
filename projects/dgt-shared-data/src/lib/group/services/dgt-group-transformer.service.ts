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
import { DGTDataGroup } from '../models/data-group.model';

@DGTInjectable()
export class DGTGroupTransformerService implements DGTLDTransformer<DGTDataGroup> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService,
    ) { }

    public toDomain<T extends DGTDataGroup>(resources: DGTLDResource[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entities: resources });

        return forkJoin(resources.map(entity => this.toDomainOne<T>(entity)))
            .pipe(
                map(categories => _.flatten(categories)),
            );
    }

    private toDomainOne<T extends DGTDataGroup>(resource: DGTLDResource): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entity: resource });

        let res: DGTDataGroup[] = null;

        if (resource && resource.triples) {
            const groupValues = resource.triples.filter(value =>
                value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
                value.object.value === 'http://digita.ai/voc/groups#group',
            );

            if (groupValues) {
                res = groupValues.map(groupValue => this.transformOne<T>(groupValue, resource));
            }
        }

        this.logger.debug(DGTGroupTransformerService.name, 'Transformed values to groups', { entity: resource, res });

        return of(res as T[]);
    }

    public toTriples<T extends DGTDataGroup>(groups: DGTDataGroup[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ groups });
        this.logger.debug(DGTGroupTransformerService.name, 'Starting to transform to linked data', { groups });

        const transformedCategories = groups.map<DGTDataGroup>(resource => {

            const resourceSubject = {
                value: resource.uri,
                termType: DGTLDTermType.REFERENCE,
            } as DGTLDNode;

            let newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        dataType: DGTLDDataType.STRING,
                        value: 'http://digita.ai/voc/groups#group',
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/groups#description',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.description,
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

        this.logger.debug(DGTGroupTransformerService.name, 'Transformed groups to linked data', transformedCategories);

        return of(transformedCategories as T[]);
    }

    private transformOne<T extends DGTDataGroup>(triple: DGTLDTriple, resource: DGTLDResource): T {
        this.paramChecker.checkParametersNotNull({ triple, entity: resource });

        const resourceTriples = resource.triples.filter(value =>
            value.subject.value === triple.subject.value);

        const description = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/groups#description',
        );

        return {
            uri: triple.subject.value,
            description: description ? description.object.value : null,
            exchange: null,
            triples: null,
        } as T;
    }
}
