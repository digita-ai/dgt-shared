import { DGTErrorNotImplemented, DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTCacheService } from './dgt-cache.service';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTLDFilterService, DGTLDTripleFactoryService } from '@digita-ai/dgt-shared-data/public-api';
import * as _ from 'lodash';


/**
 * The DGTCacheSolidService is used to communicate with a Solid based cache
 * It features basic CRUD operations
 * Implementation based on https://github.com/solid/community-server documentation
 */
@DGTInjectable()
export class DGTCacheSolidService extends DGTCacheService {

    public databaseUrl = 'http://192.168.0.224:9999/blazegraph/namespace/kb/sparql';

    constructor(
        private http: DGTHttpService,
        private logger: DGTLoggerService,
        private filters: DGTLDFilterService,
        private triples: DGTLDTripleFactoryService,
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



        const headers = {
            Accept: 'text/turtle',
        };

        const id = uri.split('#')[1];

        return of({uri, headers}).pipe(
            switchMap(data => this.http.get<string>(data.uri, data.headers)
                .pipe(map(response => ({ ...data, response, triples: response.data ? this.triples.createFromString(response.data, data.uri) : [] })))
            ),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Got response from cache', data)),
            switchMap(data => transformer.toDomain([{ triples: data.triples, uri: data.uri, exchange: null }])
                .pipe(map(resources => ({...data, resources }))),
            ),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Transformed triples to resources', data)),
            map(data => _.head(data.resources)),
        );
    }

    /**
     * Retrieves all? DGTLDResources from the cache
     * @param transformer The transformer for this type of DGTLDResource
     * @param filter The filter to run on the retrieved list of DGTLDResources
     */
    public query<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, filter: DGTLDFilter): Observable<T[]> {

        // TODO determine which file(s) should be queried
        //      holders are stored at https://domain.of.our.cache/holder
        //      we need some way of determining which type T is:
        //      - add a resourceType attribute to DGTLDResource? eg DGTLDResourceType.HOLDER = 'holder'
        //      - or use instanceof and refactor DGTHolder etc to abstract classes? (not interfaces)
        //      - or pass prefix to this function?
        //      - or query all known SDM folders and use filters? <- i believe this is what this function is supposed to do?
        //                                                              get exists for a single uri i guess

        const uri = ''; // TBD see note at top
        const headers = {
            Accept: 'text/turtle',
        };

        return of({uri, headers}).pipe(
            switchMap(data => this.http.get<string>(data.uri, data.headers)
                .pipe(map(response => ({ ...data, response, triples: response.data ? this.triples.createFromString(response.data, data.uri) : [] })))
            ),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Got response from cache', data)),
            switchMap(data => transformer.toDomain([{ triples: data.triples, uri: data.uri, exchange: null }])
                .pipe(map(resources => ({...data, resources }))),
            ),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Transformed triples to resources', data)),
            switchMap(data => this.filters.run<T>(filter, data.resources)
                .pipe(map(resources => ({...data, resources})))
            ),
            tap(data => this.logger.debug(DGTCacheSolidService.name, 'Ran filter on resources', {data, filter})),
            map(data => data.resources),
        );

    }

    /**
     * Deletes one or more resource(s) from the cache
     * @param transformer The transformer for this type of DGTLDResource
     * @param resources Resources to delete
     */
    public delete<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resources: T[]): Observable<T[]> {
        throw new Error('Method not implemented.');
    }

    /**
     * Saves one or more resource(s) to the cache
     * @param transformer The transformer for this type of DGTLDResource
     * @param resources Resources to save
     */
    public save<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, resources: T[]): Observable<T[]> {
        throw new Error('Method not implemented.');
    }
}
