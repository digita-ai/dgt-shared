import { Session } from '@inrupt/solid-client-authn-browser';
import { Observable } from 'rxjs';
import { DGTHttpResponse } from '../models/dgt-http-response.model';

export abstract class DGTHttpService {
  public abstract delete<T>(uri: string, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>>;
  public abstract get<T>(uri: string, headers?: { [key: string]: string }, isText?: boolean, session?: Session): Observable<DGTHttpResponse<T>>;
  public abstract patch<T>(uri: string, body: any, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>>;
  public abstract post<T>(uri: string, body: any, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>>;
  public abstract put<T>(uri: string, body: any, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>>;
  public abstract head<T>(uri: string, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>>;
  public abstract options<T>(uri: string, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>>;
}
