import { Observable } from 'rxjs';
import * as rdf from 'rdflib';

export interface DGTLDParser<T> {
    parse(webId: string, store: rdf.IndexedFormula): Observable<T>;
}
