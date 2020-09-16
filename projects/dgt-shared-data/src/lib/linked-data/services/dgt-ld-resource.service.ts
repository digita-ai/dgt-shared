import { Observable } from 'rxjs';

export interface DGTLDResourceService<T> {
    get(id: string): Observable<T>;
    query(filter: Partial<T>): Observable<T[]>;
}