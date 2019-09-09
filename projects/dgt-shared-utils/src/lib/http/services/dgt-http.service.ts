
import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DGTLoggerService } from '../../logging/services/dgt-logger.service';
import { DGTHttpResponse } from '../models/dgt-http-response.model';

@Injectable()
export class DGTHttpService {

  constructor(public http: HttpClient, public logger: DGTLoggerService) {
  }

  public get<T>(uri: string): Observable<DGTHttpResponse<T>> {
    this.logger.debug(DGTHttpService.name, 'Getting from URI', { uri });

    return this.http.get(uri)
      .pipe(
        map(data => data as T),
        map(data => ({
          data,
          success: true
        })),
        catchError(error => of(this.handleError<T>(error))),
      );
  }

  public post<T>(uri: string, body: any): Observable<DGTHttpResponse<T>> {
    this.logger.debug(DGTHttpService.name, 'Posting to URI', { uri, body });

    return this.http.post(uri, body)
      .pipe(
        map(data => data as T),
        map(data => ({
          data,
          success: true
        })),
        catchError(error => of(this.handleError<T>(error))),
      );
  }

  public put<T>(uri: string, body: any): Observable<DGTHttpResponse<T>> {
    this.logger.debug(DGTHttpService.name, 'Putting to URI', { uri, body });

    return this.http.put(uri, body)
      .pipe(
        map(data => data as T),
        map(data => ({
          data,
          success: true
        })),
        catchError(error => of(this.handleError<T>(error))),
      );
  }

  private handleError<T>(error: HttpErrorResponse): DGTHttpResponse<T> {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      this.logger.debug(DGTHttpService.name, 'An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      this.logger.debug(DGTHttpService.name,
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return {
      data: null,
      success: false
    };
  }
}
