import { DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTCacheService } from './dgt-cache.service';
import { DGTSparqlQueryService } from '../../sparql/services/dgt-sparql-query.service';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';

@DGTInjectable()
export class DGTCacheBlazeGraphService extends DGTCacheService {

    public databaseUrl = 'http://192.168.0.224:9999/blazegraph/namespace/kb/sparql';

    constructor(private http: DGTHttpService, private sparqlService: DGTSparqlQueryService, private logger: DGTLoggerService,) {
        super();
    }

    public query<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, filter: DGTLDFilter): Observable<T[]> {

        let responseJson: any;
        const headers = {
            'Content-Type': 'application/sparql-query',
            'Accept': 'application/sparql-results+json'
        };
        // Select everything
        const body = 'SELECT $s $p $o WHERE { $s $p $o }';
        return this.http.post<string>(this.databaseUrl, body, headers)
            .pipe(
                map(response => {
                    if (response) {
                        responseJson = response.data;
                        console.log(responseJson);
                    }
                    return responseJson;
                }
                ));
    }

    public delete<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, objects: T[]): Observable<T[]> {
        throw new Error('Method not implemented.');
    }

    public save<T extends DGTLDResource>(transformer: DGTLDTransformer<T>, objects: T[]): Observable<T[]> {
        throw new Error('Method not implemented.');
        
        // toBeSaved is a domain object that has to be transformed to triples
        // then a correct sparql query can be formed with the transformer and triples
        // TODO Do we need the connection here : 
        // return transformer.toTriples(toBeSaved, connection).pipe(
        //     map(data => {
        //         const result = this.sparqlService.generateSparqlUpdate(data, 'insert', null);
        //         // This generates correct update query. We can update the triples in the blazegraph database with these.
        //         // example
        //         /*
        //         *INSERT DATA {
        //             <undefined#62680300-2b95-4f9e-b84b-73fa45e09328> <http://digita.ai/voc/events#description> "description"^^<http://www.w3.org/2001/XMLSchema#string>;
        //             <http://digita.ai/voc/events#stakeholder> "stakeholder"^^<http://www.w3.org/2001/XMLSchema#string>;
        //             <http://digita.ai/voc/events#createdAt> ""^^<http://www.w3.org/2001/XMLSchema#dateTime>;
        //             <http://digita.ai/voc/events#icon> "het icoontje"^^<http://www.w3.org/2001/XMLSchema#string>;
        //             <http://digita.ai/voc/events#uri> "http://something"^^<http://www.w3.org/2001/XMLSchema#string>.
        //             <#> <http://digita.ai/voc/events#event> <undefined#62680300-2b95-4f9e-b84b-73fa45e09328>.
        //         }
        //         */

        //         this.logger.debug(DGTCacheBlazeGraphService.name,
        //             'generating sparql',
        //             result);
        //         return null;
        //     }
        //     ));
    }

    // public getValuesForExchange(exchange: DGTExchange): Observable<DGTLDTriple[]> {
    //     throw new Error('Method not implemented.');
    // }

    // public storeForExchange(exchange: DGTExchange, values: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    //     this.logger.debug(DGTCacheService.name, 'Storing values for exchange to cache', { exchange, values });
    //     return of({ values, exchange })
    //         .pipe(
    //             // switchMap(data => this.remove({ conditions: [{ field: 'exchange', operator: '==', value: data.exchange.id }] })
    //             //     .pipe(map(removal => data))),
    //             tap(data => this.logger.debug(DGTCacheService.name, 'Removed old values, ready to store new ones', data)),
    //             map(data => data.values),
    //         );
    // }

    // private convertToTriples(triples: DGTLDTriple[]): Triple[] {
    //     return triples.map((triple: DGTLDTriple) => {
    //         let object: Term = `${triple.object.value}` as Term;

    //         if (triple.object.termType === DGTLDTermType.LITERAL) {
    //             object = `\"${triple.object.value}\"^^${triple.object.dataType}` as Term;
    //         }

    //         return {
    //             subject: triple.subject.value as Term,
    //             predicate: triple.predicate as Term,
    //             object,
    //         };
    //     });
    // }

    // private encode(data): string {
    //     const pairs = [];

    //     Object.keys(data).forEach((key) => {
    //         pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    //     });

    //     return pairs.join('&');
    // }
}