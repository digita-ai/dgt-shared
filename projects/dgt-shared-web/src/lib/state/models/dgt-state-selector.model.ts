import { Observable } from 'rxjs';

export interface DGTStateSelector<K, L> { 
    execute(input: K): Observable<L>;
}