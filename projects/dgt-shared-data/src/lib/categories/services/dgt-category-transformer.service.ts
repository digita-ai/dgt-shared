import { Observable, of, forkJoin } from 'rxjs';

import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDDataType } from '../../linked-data/models/dgt-ld-data-type.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTCategory } from '../models/dgt-category.model';
import { DGTLDNode } from '../../linked-data/models/dgt-ld-node.model';
import { DGTLDFilter, DGTLDFilterBGP } from '@digita-ai/dgt-shared-data/public-api';
import { DGTLDFilterType } from '../../linked-data/models/dgt-ld-filter-type.model';

/** Transforms linked data to categories, and the other way around. */
@DGTInjectable()
export class DGTCategoryTransformerService implements DGTLDTransformer<DGTCategory> {

    constructor(
        private logger: DGTLoggerService,
        private paramChecker: DGTParameterCheckerService
    ) { }

    /**
     * Transforms multiple linked data entities to categories.
     * @param resources Linked data objects to be transformed to categories
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of categories
     */
    public toDomain<T extends DGTCategory>(resources: DGTLDResource[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entities: resources });

        return forkJoin(resources.map(entity => this.toDomainOne<T>(entity)))
            .pipe(
                map(categories => _.flatten(categories))
            );
    }

    /**
     * Transformed a single linked data entity to categories.
     * @param resource The linked data entity to be transformed to categories.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of categories
     */
    private toDomainOne<T extends DGTCategory>(resource: DGTLDResource): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ entity: resource });

        let res: DGTCategory[] = null;

        if (resource && resource.triples) {
            const categoriesubjectValues = resource.triples.filter(value =>
                value.predicate === 'http://digita.ai/voc/categories#category' &&
                value.subject.value.endsWith('category#')
            );

            if (categoriesubjectValues) {
                res = categoriesubjectValues.map(categoriesubjectValue => this.transformOne(categoriesubjectValue, resource));
            }
        }

        this.logger.debug(DGTCategoryTransformerService.name, 'Transformed values to categories', { entity: resource, res });

        return of(res as T[]);
    }

    /**
     * Converts categories to linked data.
     * @param categories The categories which will be transformed to linked data.
     * @param connection The connection on which the categories are stored.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns Observable of linked data entities.
     */
    public toTriples<T extends DGTCategory>(categories: DGTCategory[]): Observable<T[]> {
        this.paramChecker.checkParametersNotNull({ categories });
        this.logger.debug(DGTCategoryTransformerService.name, 'Starting to transform to linked data', { categories });

        const transformedCategories = categories.map<DGTCategory>(resource => {

            const resourceSubject = {
                value: resource.uri,
                termType: DGTLDTermType.REFERENCE
            } as DGTLDNode;

            let newTriples: DGTLDTriple[] = [
                {
                    predicate: 'http://digita.ai/voc/categories#category',
                    subject: { value: `${resource.uri.split('#')[0]}#`, termType: DGTLDTermType.REFERENCE },
                    object: resourceSubject,
                },
                {
                    predicate: 'http://digita.ai/voc/categories#description',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.description
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/categories#filter',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.filter
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/categories#groupId',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.groupId
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/categories#icon',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.icon
                    },
                },
                {
                    predicate: 'http://digita.ai/voc/categories#title',
                    subject: resourceSubject,
                    object: {
                        termType: DGTLDTermType.LITERAL,
                        dataType: DGTLDDataType.STRING,
                        value: resource.title
                    },
                },
            ];

            newTriples = newTriples.concat(this.filterToTriples(resource, resourceSubject));

            return {
                ...resource,
                exchange: resource.exchange,
                uri: resource.uri,
                triples: newTriples
            };
        });

        this.logger.debug(DGTCategoryTransformerService.name, 'Transformed categories to linked data', transformedCategories);

        return of(transformedCategories as T[]);
    }

    /**
     * Creates a single category from linked data.
     * @param triple The entity of the the category's subject.
     * @param resource The entity to be transformed to an category.
     * @throws DGTErrorArgument when arguments are incorrect.
     * @returns The transformed category.
     */
    private transformOne<T extends DGTCategory>(triple: DGTLDTriple, resource: DGTLDResource): T {
        this.paramChecker.checkParametersNotNull({ triple, entity: resource });

        const resourceTriples = resource.triples.filter(value =>
            value.subject.value === triple.object.value);

        const description = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/categories#description'
        );

        const groupId = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/categories#groupId'
        );

        const icon = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/categories#icon'
        );

        const title = resourceTriples.find(value =>
            value.predicate === 'http://digita.ai/voc/categories#title'
        );

        const filter = this.filterToDomain(triple, resource);

        return {
            uri: triple.object.value,
            description: description ? description.object.value : null,
            exchange: null,
            groupId: groupId ? groupId.object.value : null,
            icon: icon ? icon.object.value : null,
            title: title ? title.object.value : null,
            triples: null,
            filter,
        } as T;
    }

    private filterToTriples(resource: DGTCategory, resourceSubject: DGTLDNode): DGTLDTriple[] {
        let res = [];

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        if (!resourceSubject) {
            throw new DGTErrorArgument('Argument resourceSubject should be set.', resourceSubject);
        }

        if (!resource.filter) {
            throw new DGTErrorArgument('Argumentresource.filter should be set.', resource.filter);
        }

        if (resource.filter.type !== DGTLDFilterType.BGP) {
            throw new DGTErrorArgument('Argument resource filter type should be BGP.', resource);
        }

        // solid connection
        // local copy of config to have autofill
        const filter: DGTLDFilterBGP = resource.filter as any;

        res = [
            {
                predicate: 'http://digita.ai/voc/categoryfilter#type',
                subject: resourceSubject,
                object: {
                    termType: DGTLDTermType.LITERAL,
                    dataType: DGTLDDataType.STRING,
                    value: filter.type
                },
            },
        ];

        filter.predicates?.forEach(predicate => {
            res.push({
                predicate: 'http://digita.ai/voc/categoryfilter#predicates',
                subject: resourceSubject,
                object: {
                    termType: DGTLDTermType.REFERENCE,
                    dataType: DGTLDDataType.STRING,
                    value: predicate
                },
            });
        });

        return res;
    }

    private filterToDomain(triple: DGTLDTriple, resource: DGTLDResource): DGTLDFilter {

        let config: DGTLDFilter = null;

        if (!triple) {
            throw new DGTErrorArgument('Argument triple should be set.', triple);
        }

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        const type = resource.triples.find(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/categoryfilter#type'
        );

        const predicates: string[] = resource.triples.filter(value =>
            value.subject.value === triple.object.value &&
            value.predicate === 'http://digita.ai/voc/categoryfilter#predicates'
        ).map(predicate => predicate.object.value);

        config = {
            type: DGTLDFilterType.BGP,
            predicates,
        } as DGTLDFilterBGP;

        return config;
    }
}
