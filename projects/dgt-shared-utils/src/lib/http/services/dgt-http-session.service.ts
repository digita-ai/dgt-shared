import { map, catchError, tap, mergeMap } from 'rxjs/operators';
import { Observable, of, from } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DGTLoggerService } from '../../logging/services/dgt-logger.service';
import { DGTHttpResponse } from '../models/dgt-http-response.model';
import { DGTHttpService } from './dgt-http.service';
import { DGTInjectable } from '../../decorators/dgt-injectable';
import { Session } from '@inrupt/solid-client-authn-browser';

@DGTInjectable()
export class DGTHttpSessionService extends DGTHttpService {

    constructor(public http: HttpClient, public logger: DGTLoggerService) {
        super();
    }

    public get<T>(uri: string, headers?: { [key: string]: string }, isText: boolean = false, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Getting from URI', { uri, session });

        const request = from(session.fetch(uri, { method: 'GET', headers }));

        return request
            .pipe(
                mergeMap(response => from(response.text()).pipe(
                    map(text => ({ response, text })),
                )),
                map(d => ({
                    data: d.text as any,
                    success: d.response.ok,
                    status: d.response.status,
                    header: d.response.headers,
                })),
                catchError(error => of(this.handleError<T>(error))),
            );
    }

    public post<T>(uri: string, body: any, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Posting to URI', { uri, body, session });

        return from(session.fetch(uri, { method: 'POST', headers, body }))
            .pipe(
                mergeMap(response => from(response.text()).pipe(
                    map(text => ({ response, text })),
                )),
                map(d => ({
                    data: d.text as any,
                    success: d.response.ok,
                    status: d.response.status,
                    header: d.response.headers,
                })),
                catchError(error => of(this.handleError<T>(error))),
            );
    }

    public put<T>(uri: string, body: any, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Putting to URI', { uri, body, session });

        return from(session.fetch(uri, { method: 'PUT', headers, body }))
            .pipe(
                mergeMap(response => from(response.text()).pipe(
                    map(text => ({ response, text })),
                )),
                map(d => ({
                    data: d.text as any,
                    success: d.response.ok,
                    status: d.response.status,
                    headers: d.response.headers,
                })),
                catchError(error => of(this.handleError<T>(error))),
            );
    }

    public delete<T>(uri: string, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Deleting to URI', { uri, headers, session });

        return from(session.fetch(uri, { method: 'DELETE', headers }))
            .pipe(
                mergeMap(response => from(response.text()).pipe(
                    map(text => ({ response, text })),
                )),
                map(d => ({
                    data: d.text as any,
                    success: d.response.ok,
                    status: d.response.status,
                    headers: d.response.headers,
                })),
                catchError(error => of(this.handleError<T>(error))),
            );
    }

    public patch<T>(uri: string, body: any, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Patching to URI', { uri, body, session });

        return from(session.fetch(uri, { method: 'PATCH', headers, body }))
            .pipe(
                mergeMap(response => from(response.text()).pipe(
                    map(text => ({ response, text })),
                )),
                map(d => ({
                    data: d.text as any,
                    success: d.response.ok,
                    status: d.response.status,
                    headers: d.response.headers,
                })),
                catchError(error => of(this.handleError<T>(error))),
            );
    }

    public head<T>(uri: string, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Sending HEAD request', { uri, session });

        return from(session.fetch(uri, { method: 'HEAD', headers }))
            .pipe(
                mergeMap(response => from(response.text()).pipe(
                    map(text => ({ response, text })),
                )),
                map(d => ({
                    data: d.text as any,
                    success: d.response.ok,
                    status: d.response.status,
                    headers: d.response.headers,

                })),
                catchError(error => of(this.handleError<T>(error))),
            );
    }

    public options<T>(uri: string, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Sending OPTIONS request', { uri, session });

        return from(session.fetch(uri, { method: 'OPTIONS', headers }))
            .pipe(
                mergeMap(response => from(response.text()).pipe(
                    map(text => ({ response, text })),
                )),
                map(d => ({
                    data: d.text as any,
                    success: d.response.ok,
                    status: d.response.status,
                    headers: d.response.headers,
                })),
                catchError(error => of(this.handleError<T>(error))),
            );
    }

    private handleError<T>(error: HttpErrorResponse): DGTHttpResponse<T> {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            this.logger.debug(DGTHttpSessionService.name, 'An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            this.logger.debug(DGTHttpSessionService.name,
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`, error);
        }
        // return an observable with a user-facing error message
        return {
            data: null,
            success: false,
            status: error.status
        };
    }
}
