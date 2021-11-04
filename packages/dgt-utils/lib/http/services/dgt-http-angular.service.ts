
import { catchError, map, tap } from 'rxjs/operators';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { DGTLoggerService } from '../../logging/services/dgt-logger.service';
import { DGTHttpResponse } from '../models/dgt-http-response.model';
import { DGTHttpService } from './dgt-http.service';

@Injectable()
export class DGTHttpAngularService extends DGTHttpService {

  constructor(public http: HttpClient, public logger: DGTLoggerService) {

    super();

  }

  get<T>(uri: string, headers?: { [key: string]: string }, isText = false): Observable<DGTHttpResponse<T>> {

    this.logger.debug(DGTHttpAngularService.name, 'Getting from URI', { uri });

    let request = this.http.get(uri, { headers, observe: 'response' });

    if (isText) {

      request = this.http.get(uri, { headers, responseType: 'text', observe: 'response' });

    }

    return request
      .pipe(
        tap((data) => this.logger.debug(DGTHttpAngularService.name, 'Received response', { data })),
        map((response) => ({
          data: response.body as T,
          success: true,
          status: response.status,
        })),
        catchError((error) => of(this.handleError<T>(error))),
      );

  }

  post<T>(uri: string, body: any, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    this.logger.debug(DGTHttpAngularService.name, 'Posting to URI', { uri, body });

    return this.http.post(uri, body, { headers, observe: 'response' })
      .pipe(
        map((response) => ({
          data: response.body as T,
          success: true,
          status: response.status,
        })),
        catchError((error) => of(this.handleError<T>(error))),
      );

  }

  put<T>(uri: string, body: any, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    this.logger.debug(DGTHttpAngularService.name, 'Putting to URI', { uri, body });

    return this.http.put(uri, body, { headers, observe: 'response' })
      .pipe(
        map((response) => ({
          data: response.body as T,
          success: true,
          status: response.status,
        })),
        catchError((error) => of(this.handleError<T>(error))),
      );

  }

  delete<T>(uri: string, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    this.logger.debug(DGTHttpAngularService.name, 'Deleting to URI', { uri, headers });

    return this.http.delete(uri, { headers, observe: 'response' })
      .pipe(
        map((response) => ({
          data: response.body as T,
          success: true,
          status: response.status,
        })),
        catchError((error) => of(this.handleError<T>(error))),
      );

  }

  patch<T>(uri: string, body: any, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    this.logger.debug(DGTHttpAngularService.name, 'Patching to URI', { uri, body });

    return this.http.patch(uri, body, { headers, observe: 'response' })
      .pipe(
        map((response) => ({
          data: response.body as T,
          success: true,
          status: response.status,
        })),
        catchError((error) => of(this.handleError<T>(error))),
      );

  }

  head<T>(uri: string, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    this.logger.debug(DGTHttpAngularService.name, 'Sending HEAD request', { uri });

    return this.http.head(uri, { headers, observe: 'response' })
      .pipe(
        map((response) => ({
          data: response.body as T,
          success: true,
          status: response.status,
          headers: response.headers as any,
        })),
        catchError((error) => of(this.handleError<T>(error))),
      );

  }

  options<T>(uri: string, headers?: { [key: string]: string }): Observable<DGTHttpResponse<T>> {

    this.logger.debug(DGTHttpAngularService.name, 'Sending OPTIONS request', { uri });

    return this.http.options(uri, { headers, observe: 'response' })
      .pipe(
        map((response) => ({
          data: response.body as T,
          success: true,
          status: response.status,
          headers: response.headers as any,
        })),
        catchError((error) => of(this.handleError<T>(error))),
      );

  }

  private handleError<T>(error: HttpErrorResponse): DGTHttpResponse<T> {

    if (error.error instanceof ErrorEvent) {

      // A client-side or network error occurred. Handle it accordingly.
      this.logger.debug(DGTHttpAngularService.name, 'An error occurred:', error.error.message);

    } else {

      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      this.logger.debug(DGTHttpAngularService.name,
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`,
        error);

    }

    // return an observable with a user-facing error message
    return {
      data: null,
      success: false,
      status: error.status,
    };

  }

}
