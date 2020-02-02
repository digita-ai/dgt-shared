
import { Observable } from 'rxjs';
import { DGTHttpResponse } from '../models/dgt-http-response.model';

export abstract class DGTHttpService {
  public abstract get<T>(uri: string, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>>;
  public abstract post<T>(uri: string, body: any, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>>;
  public abstract put<T>(uri: string, body: any, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>>;
}
