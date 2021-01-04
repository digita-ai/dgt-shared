
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable } from 'rxjs';
import { DGTSparqlResult } from '../models/dgt-sparql-result.model';

@DGTInjectable()
export abstract class DGTSparqlService<T> {
    public abstract query(query: string, options: T): Observable<DGTSparqlResult>;
}
