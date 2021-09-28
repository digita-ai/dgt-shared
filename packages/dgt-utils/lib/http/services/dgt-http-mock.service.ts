import { Observable, of } from 'rxjs';
import { DGTLoggerService } from '../../logging/services/dgt-logger.service';
import { DGTHttpResponse } from '../models/dgt-http-response.model';
import { DGTHttpService } from './dgt-http.service';

export class DGTHttpMockService extends DGTHttpService {

  delete<T>(uri: string, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    return of(null);

  }
  get<T>(uri: string, headers?: { [key: string]: string }, isText?: boolean): Observable<DGTHttpResponse<T>> {

    return of(null);

  }
  patch<T>(uri: string, body: any, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    return of(null);

  }
  post<T>(uri: string, body: any, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    return of(null);

  }
  put<T>(uri: string, body: any, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    return of(null);

  }
  head<T>(uri: string, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    return of(null);

  }
  options<T>(uri: string, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    return of(null);

  }
  constructor(public logger: DGTLoggerService) {

    super();

  }

}
