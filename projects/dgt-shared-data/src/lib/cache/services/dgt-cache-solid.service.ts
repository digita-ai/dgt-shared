import { DGTConfigurationBaseApi, DGTConfigurationService, DGTErrorArgument, DGTHttpResponse, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { concat, forkJoin, merge, Observable, of } from 'rxjs';
import { last, map, switchMap, tap } from 'rxjs/operators';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTCacheService } from './dgt-cache.service';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import * as _ from 'lodash';
import { DGTLDFilterService } from '../../linked-data/services/dgt-ld-filter.service';
import { DGTLDTripleFactoryService } from '../../linked-data/services/dgt-ld-triple-factory.service';
import { DGTLDRepresentationTurtleFactory } from '../../linked-data/services/dgt-ld-representation-turtle-factory';
import { DGTLDRepresentationSparqlInsertFactory } from '../../linked-data/services/dgt-ld-representation-sparql-insert-factory';
import { HttpParams } from '@angular/common/http';


/**
 * The DGTCacheSolidService is used to communicate with a Solid based cache
 * It features basic CRUD operations
 * Implementation based on https://github.com/solid/community-server documentation
 */
@DGTInjectable()
export class DGTCacheSolidService extends DGTCacheService {

    constructor(
        private http: DGTHttpService,
        private logger: DGTLoggerService,
        private filters: DGTLDFilterService,
        private triples: DGTLDTripleFactoryService,
        private toTurtle: DGTLDRepresentationTurtleFactory,
        private toSparqlInsert: DGTLDRepresentationSparqlInsertFactory,
        private config: DGTConfigurationService<DGTConfigurationBaseApi>,
    ) {
        super();
    }

    /**
     * Retrieves a single DGTLDResource from a Solid server
     * @param transformer The transformer for this type of DGTLDResource
     * @param uri The uri to get from
     */
    public get<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, uri: string): Observable<T> {
        this.logger.debug(DGTCacheSolidService.name, 'Starting to get', { transformer, uri });

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        if (!uri) {
            throw new DGTErrorArgument('Argument uri should be set.', uri);
        }

        return of({ uri, transformer, headers: { Accept: 'text/turtle', } }).pipe(
            switchMap(data => this.http.get<string>(data.uri, data.headers)
                .pipe(map(response => ({ ...data, response })))
            ),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Got response from cache', data)),
            switchMap(data => this.toTurtle.deserialize<T>(data.response.data, data.transformer)
                .pipe(map(resources => ({ ...data, resources })))),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Transformed response to resources', data)),
            // map(data => _.head(data.resources)),
            // TODO check if line below does what we want it to do
            map(data => data.resources.find(resource => resource.uri === data.uri)),
        );
    }

    /**
     * Retrieves all DGTLDResources from the cache
     * @param transformer The transformer for this type of DGTLDResource
     * @param filter The filter to run on the retrieved list of DGTLDResources
     */
    public query<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, filter: DGTLDFilter): Observable<T[]> {

        const headers = {
            Accept: 'text/plain',
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        // query to retrieve all SDM data from cache
        const query = encodeURIComponent(`describe ?a ?b ?c where {?a ?b ?c FILTER regex(?a, "localhost:3001/sparql/.+")}`);
        const queryString = `?query=${query}`;

        const uri = this.config.get(config => config.cache.sparqlEndpoint) + queryString;

        return of({ uri, headers, transformer }).pipe(
            switchMap(data => this.http.post<string>(data.uri, {}, data.headers)
                .pipe(map(response => ({ ...data, response })))
            ),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Got response from cache', data.response)),
            switchMap(data => this.toTurtle.deserialize<T>(data.response.data, data.transformer)
                .pipe(map(resources => ({ ...data, resources })))),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Transformed response to resources', {resources: data.resources, transformer})),
            switchMap(data => (filter ? this.filters.run<T>(filter, data.resources) : of(data.resources))
                .pipe(map(filtered => ({ ...data, filtered })))
            ),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Ran filter on resources', { filtered: data.filtered, filter })),
            map(data => data.filtered),
        );
    }

    /**
     * Deletes one or more resource(s) from the cache
     * @param transformer The transformer for this type of DGTLDResource
     * @param resources Resources to delete
     */
    public delete<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resources: T[]): Observable<T[]> {

        return of({ resources }).pipe(
            switchMap(data => forkJoin(data.resources.map(resource => this.http.delete<string>(resource.uri)
                .pipe(map(() => resource))
            )).pipe(map(res => ({ ...data, deleted: res }))) // TODO filter resources for which http status code was not 200 OK? throw errors?
            ),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Deleted resources from cache', { deleted: data.deleted, data })),
            map(data => data.deleted),
        );

    }

    /**
     * Saves one or more resource(s) to the cache
     * Depending on the DGTLDResource's uri:
     *  when set -> updates an existing DGTLDResource from the cache
     *  else -> adds a new DGTLDResource to the cache
     * @param transformer The transformer for this type of DGTLDResource
     * @param resources Resources to save
     */
    public save<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resources: T[]): Observable<T[]> {
        this.logger.debug(DGTCacheSolidService.name, 'Starting to save', { transformer, resources });

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        if (!resources) {
            throw new DGTErrorArgument('Argument resources should be set.', resources);
        }

        return of({ transformer, resources })
            .pipe(
                // concatMap(data => data.resources.map(resource => this.saveOne<T>(data.transformer, resource))),
                switchMap(data => concat(...data.resources.map(resource => this.saveOne<T>(data.transformer, resource)))),
                // switchMap(data => data),
                    // .pipe(map(savedResources => ({ ...data, savedResources })))),
                tap(data => this.logger.debug(DGTCacheSolidService.name, 'Created or appended resource', data)),
                // last(),
                tap(data => this.logger.debug(DGTCacheSolidService.name, 'Created or appended resources', data)),
                map(() => resources)
            );
    }

    private saveOne<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resource: T): Observable<T> {
        this.logger.debug(DGTCacheSolidService.name, 'Starting to save one', { transformer, resource });

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ transformer, resource, headers: { Accept: 'text/turtle' }, uri: resource.uri.split('#')[0] })
            .pipe(
                switchMap(data => this.http.head(data.uri, data.headers)
                    .pipe(map(headResponse => ({ ...data, exists: headResponse.success, headResponse })))),
                tap(data => this.logger.debug(DGTCacheSolidService.name, 'Checked if resource exists', data)),
                switchMap(data => (data.exists ? this.appendOne(data.transformer, data.resource) : this.createOne(data.transformer, data.resource))
                    .pipe(map(response => ({ ...data, response })))),
                tap(data => this.logger.debug(DGTCacheSolidService.name, 'Created or appended resource', data)),
                map(data => data.resource)
            );
    }

    private createOne<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resource: T): Observable<DGTHttpResponse<any>> {
        this.logger.debug(DGTCacheSolidService.name, 'Starting to create one', { transformer, resource });

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ transformer, resource, headers: { 'Content-Type': 'text/turtle', }, uri: resource.uri.split('#')[0] })
            .pipe(
                switchMap(data => this.toTurtle.serialize([data.resource], data.transformer)
                    .pipe(map(body => ({ ...data, body })))),
                switchMap(data => this.http.put(data.uri, data.body, data.headers)
                    .pipe(map(response => ({ ...data, response })))),
                map(data => data.response)
            );
    }

    private appendOne<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resource: T): Observable<DGTHttpResponse<any>> {
        this.logger.debug(DGTCacheSolidService.name, 'Starting to append one', { transformer, resource });

        if (!transformer) {
            throw new DGTErrorArgument('Argument transformer should be set.', transformer);
        }

        if (!resource) {
            throw new DGTErrorArgument('Argument resource should be set.', resource);
        }

        return of({ transformer, resource, headers: { 'Content-Type': 'application/sparql-update', }, uri: resource.uri.split('#')[0] })
            .pipe(
                switchMap(data => this.toSparqlInsert.serialize([data.resource], data.transformer)
                    .pipe(map(body => ({ ...data, body })))),
                switchMap(data => this.http.patch(data.uri, data.body, data.headers)
                    .pipe(map(response => ({ ...data, response })))),
                map(data => data.response)
            );
    }
}
