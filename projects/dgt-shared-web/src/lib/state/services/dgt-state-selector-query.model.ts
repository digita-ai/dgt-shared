import { DGTQuery, DGTQueryService } from '@digita-ai/dgt-shared-data';
import { Observable, of } from 'rxjs';
import { DGTStateSelector } from '../models/dgt-state-selector.model';

export class DGTStateSelectorQuery<K> implements DGTStateSelector<K, K> {

    constructor(private queries: DGTQueryService, private query: DGTQuery) { }

    execute(input: K): Observable<K> {
        return of(this.queries.execute<K>(input, this.query));
    }
}
