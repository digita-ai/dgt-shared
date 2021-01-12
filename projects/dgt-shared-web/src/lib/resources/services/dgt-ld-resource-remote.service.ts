import {
    DGTCategory,
    DGTDataGroup,
    DGTHolder,
    DGTLDFilter,
    DGTLDFilterService,
    DGTLDResource,
    DGTLDResourceTransformerService,
    DGTLDTriple,
} from '@digita-ai/dgt-shared-data';
import {
    DGTConfigurationBaseWeb,
    DGTConfigurationService,
    DGTErrorArgument,
    DGTHttpService,
    DGTInjectable,
    DGTLoggerService,
    DGTParameterCheckerService,
} from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTBaseAppState } from '../../state/models/dgt-base-app-state.model';
import { DGTBaseRootState } from '../../state/models/dgt-base-root-state.model';
import { DGTStateStoreService } from '../../state/services/dgt-state-store.service';
@DGTInjectable()
export class DGTLDResourceRemoteService {
    constructor(
        private store: DGTStateStoreService<DGTBaseRootState<DGTBaseAppState>>,
        private http: DGTHttpService,
        private logger: DGTLoggerService,
        private config: DGTConfigurationService<DGTConfigurationBaseWeb>,
        private transformer: DGTLDResourceTransformerService,
        private paramChecker: DGTParameterCheckerService,
        private filters: DGTLDFilterService,
    ) {}

    get(uri: string): Observable<DGTLDResource[]> {
        this.logger.debug(DGTLDResourceRemoteService.name, 'Starting to get', { uri });

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri }).pipe(
            map((data) => ({
                ...data,
                uri: `${this.config.get((c) => c.server.uri)}resource/${encodeURIComponent(data.uri)}`,
            })),
            switchMap((data) =>
                this.store
                    .select((state) => state.app.accessToken)
                    .pipe(map((accessToken) => ({ ...data, accessToken }))),
            ),
            switchMap((data) =>
                this.http.get<DGTLDResource[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` }),
            ),
            switchMap((response) => this.transformer.toDomain(response.data)),
            map((resources) =>
                resources[0].triples.map(
                    (triple) =>
                        ({
                            uri: triple.subject.value,
                            exchange: resources[0].exchange,
                            triples: [triple],
                        } as DGTLDResource),
                ),
            ),
        );
    }
    query(filter?: DGTLDFilter): Observable<DGTLDResource[]> {
        throw new Error('Method not implemented.');
    }
    save(resources: DGTLDResource[]): Observable<DGTLDResource[]> {
        throw new Error('Method not implemented.');
    }
    delete(resource: DGTLDResource): Observable<DGTLDResource> {
        throw new Error('Method not implemented.');
    }
    getForHolder(holder: DGTHolder): Observable<DGTLDResource[]> {
        this.logger.debug(DGTLDResourceRemoteService.name, 'Starting to get', { holder });

        if (!holder) {
            throw new DGTErrorArgument('Argument holder should be set.', holder);
        }

        return of({ holder }).pipe(
            map((data) => ({
                ...data,
                uri: `${this.config.get((c) => c.server.uri)}holder/${encodeURIComponent(data.holder.uri)}/resources`,
            })),
            switchMap((data) =>
                this.store
                    .select((state) => state.app.accessToken)
                    .pipe(map((accessToken) => ({ ...data, accessToken }))),
            ),
            switchMap((data) =>
                this.http.get<DGTLDResource[]>(data.uri, { Authorization: `Bearer ${data.accessToken}` }),
            ),
            map((response) => response.data),
            // switchMap((response) => this.transformer.toDomain(response.data)),
            // map((resources) =>
            //     resources[0].triples.map(
            //         (triple) =>
            //             ({
            //                 uri: triple.subject.value,
            //                 exchange: resources[0].exchange,
            //                 triples: [triple],
            //             } as DGTLDResource),
            //     ),
            // ),
        );
    }

    /**
     * get a list of predicates from a list of resources
     * @param resources
     * @param connection
     */
    public getPredicatesOfResources(resources: DGTLDResource[]): string[] {
        this.paramChecker.checkParametersNotNull({ resources });

        return _.flatten(
            resources.map((resource) =>
                resource.triples
                    .filter((triple) => triple.predicate !== null && triple.predicate.length > 0)
                    .map((triple) => triple.predicate),
            ),
        );
    }

    /**Î
     * get a list categories for which a resource exists
     * @param categories
     * @param resources
     * @param connection
     */
    public getCategoriesWithResources(
        categories: DGTCategory[],
        resources: DGTLDResource[],
    ): Observable<DGTCategory[]> {
        this.paramChecker.checkParametersNotNull({ categories, resources });

        this.logger.debug(DGTLDResourceRemoteService.name, 'Getting categories with resources', {
            categories,
            resources,
        });

        return of({ categories }).pipe(
            switchMap((data) =>
                forkJoin(
                    data.categories.map((category) =>
                        this.filters.run(category.filter, resources).pipe(
                            map((filteredResources) => ({
                                category,
                                triples: _.flatten(
                                    filteredResources
                                        .filter((resource) => resource.triples && resource.triples.length)
                                        .map((resource) => resource.triples),
                                )
                                    .filter(
                                        (triple) =>
                                            triple.predicate !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                                    )
                                    .filter((triple) => triple.predicate !== 'http://www.w3.org/2006/vcard/ns#value'),
                            })),
                        ),
                    ),
                ).pipe(map((triplesPerCategory) => ({ ...data, triplesPerCategory }))),
            ),
            map((data) => ({
                ...data,
                filteredTriplesPerCategory: data.triplesPerCategory.filter(
                    (categoryWithTriples) => categoryWithTriples && categoryWithTriples.triples.length > 0,
                ),
            })),
            map((data) => data.filteredTriplesPerCategory.map((triplesPerCategory) => triplesPerCategory.category)),
        );
    }

    /**
     * get a list of groups for which a resource exists
     * @param groups
     * @param categories
     * @param resources
     * @param connection
     */
    public getGroupsWithResources(
        groups: DGTDataGroup[],
        categories: DGTCategory[],
        triples: DGTLDResource[],
    ): Observable<DGTDataGroup[]> {
        this.paramChecker.checkParametersNotNull({ categories, groups, triples });

        return this.getCategoriesWithResources(categories, triples).pipe(
            map((data) =>
                groups.filter((group) => data.filter((category) => category.groupId === group.id).length > 0),
            ),
        );
    }

    /**
     * get a list of all the resources of a given category
     * @param category
     * @param resources
     * @param connection
     */
    public getResourcesOfCategory(category: DGTCategory, resources: DGTLDResource[]): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ category, resources });

        this.logger.debug(DGTLDResourceRemoteService.name, 'Getting resources of category', { category });

        return this.filters
            .run(category.filter, resources)
            .pipe(
                map(
                    (triples) =>
                        triples.filter(
                            (triple) => triple.triples !== null && triple.triples.length > 0,
                        ) as DGTLDResource[],
                ),
            );
    }

    /**
     * get a list of resources of a given list of categories
     * @param categories
     * @param resources
     * @param connection
     */
    public getResourcesOfCategories(
        categories: DGTCategory[],
        resources: DGTLDResource[],
    ): Observable<DGTLDResource[]> {
        this.paramChecker.checkParametersNotNull({ categories, resources });

        return of({ categories }).pipe(
            switchMap((data) =>
                forkJoin(data.categories.map((category) => this.getResourcesOfCategory(category, resources))),
            ),
            map((data) => _.flatten(data)),
        );
    }
}
