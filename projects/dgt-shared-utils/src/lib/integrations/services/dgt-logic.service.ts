import { Observable } from 'rxjs';

export abstract class DGTLogicService {
    public abstract execute<T, S>(name: string, data: T): Observable<S>;
}
