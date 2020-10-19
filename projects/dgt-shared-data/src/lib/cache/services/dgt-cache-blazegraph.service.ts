import { DGTHttpService, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Term, Triple } from 'sparqljs';
import { DGTExchange } from '../../holder/models/dgt-holder-exchange.model';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';
import { DGTLDTermType } from '../../linked-data/models/dgt-ld-term-type.model';
import { DGTLDTransformer } from '../../linked-data/models/dgt-ld-transformer.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { DGTQuery } from '../../metadata/models/dgt-query.model';
import { DGTCacheService } from './dgt-cache.service';
import { DGTConnection } from '../../connection/models/dgt-connection.model';
import { DGTSparqlQueryService } from '../../sparql/services/dgt-sparql-query.service';
import { DGTConnectionSolidConfiguration } from '../../connection/models/dgt-connection-solid-configuration.model';
import { DGTLDResource } from '../../linked-data/models/dgt-ld-resource.model';
import { DGTSourceSolidConfiguration } from '../../source/models/dgt-source-solid-configuration.model';
import { DGTSource } from '../../source/models/dgt-source.model';
import { DGTQueryService } from '../../metadata/services/dgt-query.service';

@DGTInjectable()
export class DGTCacheBlazeGraphService extends DGTCacheService {

    public databaseUrl = 'http://192.168.0.224:9999/blazegraph/namespace/kb/sparql';

    constructor(private http: DGTHttpService,
        private sparqlService : DGTSparqlQueryService, 
        private queries: DGTQueryService, 
        private logger: DGTLoggerService;) {
        super();
    }

    public getValuesForExchange(exchange: DGTExchange): Observable<DGTLDTriple[]> {
        throw new Error('Method not implemented.');
    }
    public remove(query: DGTQuery): Observable<any> {
        throw new Error('Method not implemented.');
    }
    public storeForExchange(exchange: DGTExchange, values: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTCacheService.name, 'Storing values for exchange to cache', { exchange, values });
        return of({ values, exchange })
            .pipe(
                switchMap(data => this.remove({ conditions: [{ field: 'exchange', operator: '==', value: data.exchange.id }] })
                    .pipe(map(removal => data))),
                tap(data => this.logger.debug(DGTCacheService.name, 'Removed old values, ready to store new ones', data)),
                tap(data => this.cache = data.values),
                map(data => data.values),
            );
    }
    public query<T>(filter: DGTLDFilter, transformer: DGTLDTransformer<T>): Observable<any> {

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
    
    public delete<R extends DGTLDResource>(domainEntities: R[], connection: DGTConnection<DGTConnectionSolidConfiguration>, source: DGTSource<DGTSourceSolidConfiguration>, transformer: DGTLDTransformer<R>): Observable<R[]> {
        throw new Error('Method not implemented.');
    }

    private convertToTriples(triples: DGTLDTriple[]): Triple[] {
        return triples.map((triple: DGTLDTriple) => {
            let object: Term = `${triple.object.value}` as Term;

            if (triple.object.termType === DGTLDTermType.LITERAL) {
                object = `\"${triple.object.value}\"^^${triple.object.dataType}` as Term;
            }

            return {
                subject: triple.subject.value as Term,
                predicate: triple.predicate as Term,
                object,
            };
        });
    }

    private encode(data): string {
        const pairs = [];

        Object.keys(data).forEach((key) => {
            pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        });

        return pairs.join('&');
    }

    public save<T>(transformer: DGTLDTransformer<T>, toBeSaved: T[], connection: DGTConnection<any>): Observable<DGTLDTriple[] | T[]>{
        // toBeSaved is a domain object that has to be transformed to triples
        // then a correct sparql query can be formed with the transformer and triples
        // TODO Do we need the connection here : 
        return transformer.toTriples(toBeSaved, connection).pipe(
            map(data => {
                const result = this.sparqlService.generateSparqlUpdate(data, 'insert', null);
                // This generates correct update query. We can update the triples in the blazegraph database with these.
                // example
                /*
                *INSERT DATA {
                    <undefined#62680300-2b95-4f9e-b84b-73fa45e09328> <http://digita.ai/voc/events#description> "description"^^<http://www.w3.org/2001/XMLSchema#string>;
                    <http://digita.ai/voc/events#stakeholder> "stakeholder"^^<http://www.w3.org/2001/XMLSchema#string>;
                    <http://digita.ai/voc/events#createdAt> ""^^<http://www.w3.org/2001/XMLSchema#dateTime>;
                    <http://digita.ai/voc/events#icon> "het icoontje"^^<http://www.w3.org/2001/XMLSchema#string>;
                    <http://digita.ai/voc/events#uri> "http://something"^^<http://www.w3.org/2001/XMLSchema#string>.
                    <#> <http://digita.ai/voc/events#event> <undefined#62680300-2b95-4f9e-b84b-73fa45e09328>.
                }
                */

                this.logger.debug(DGTCacheBlazeGraphService.name,
                    'generating sparql',
                    result);
                return null;
            }
            ));
    }

}