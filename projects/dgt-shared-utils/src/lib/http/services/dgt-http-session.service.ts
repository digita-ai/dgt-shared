import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Session } from '@inrupt/solid-client-authn-browser';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DGTInjectable } from '../../decorators/dgt-injectable';
import { DGTLoggerService } from '../../logging/services/dgt-logger.service';
import { DGTHttpResponse } from '../models/dgt-http-response.model';
import { DGTHttpService } from './dgt-http.service';

@DGTInjectable()
export class DGTHttpSessionService extends DGTHttpService {

    constructor(public http: HttpClient, public logger: DGTLoggerService) {
        super();
    }

    public get<T>(uri: string, headers?: { [key: string]: string }, isText: boolean = false, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Getting from URI', { uri, session, headers });

        return of({ uri, headers, session })
            .pipe(
                switchMap(data => from(data.session.fetch(data.uri, { method: 'GET', headers: data.headers })).pipe(
                    map(response => ({ ...data, response })),
                )),
                switchMap(data => from(data.response.text()).pipe(
                    map(text => ({ ...data, text })),
                )),
                map(data => ({
                    data: data.text as any,
                    success: data.response.ok,
                    status: data.response.status,
                    headers: data.response.headers,
                })),
                catchError(error => of(this.handleError<T>(error))),
            );
    }

    public post<T>(uri: string, body: any, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Posting to URI', { uri, body, session, headers });

        return of({ uri, body, headers, session })
            .pipe(
                switchMap(data => from(session.fetch(uri, { method: 'POST', headers: data.headers, body })).pipe(
                    map(response => ({ ...data, response })),
                )),
                switchMap(data => from(data.response.text()).pipe(
                    map(text => ({ ...data, text })),
                )),
                map(data => ({
                    data: data.text as any,
                    success: data.response.ok,
                    status: data.response.status,
                    headers: data.response.headers,
                })),
                catchError(error => of(this.handleError<T>(error))),
            );
    }

    public put<T>(uri: string, body: any, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Putting to URI', { uri, body, session, headers });

        return of({ uri, body, headers, session }).pipe(
            switchMap(data => from(session.fetch(uri, { method: 'PUT', headers: data.headers, body })).pipe(
                map(response => ({ ...data, response })),
            )),
            switchMap(data => from(data.response.text()).pipe(
                map(text => ({ ...data, text })),
            )),
            map(data => ({
                data: data.text as any,
                success: data.response.ok,
                status: data.response.status,
                headers: data.response.headers,
            })),
            catchError(error => of(this.handleError<T>(error))),
        );
    }

    public delete<T>(uri: string, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Deleting to URI', { uri, headers, session });

        return of({ uri, headers, session }).pipe(
            switchMap(data => from(session.fetch(uri, { method: 'DELETE', headers: data.headers })).pipe(
                map(response => ({ ...data, response })),
            )),
            switchMap(data => from(data.response.text()).pipe(
                map(text => ({ ...data, text })),
            )),
            map(data => ({
                data: data.text as any,
                success: data.response.ok,
                status: data.response.status,
                headers: data.response.headers,
            })),
            catchError(error => of(this.handleError<T>(error))),
        );
    }

    public patch<T>(uri: string, body: any, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Patching to URI', { uri, body, session, headers });

        return of({ uri, body, headers, session }).pipe(
            switchMap(data => from(session.fetch(uri, { method: 'PATCH', headers: data.headers, body })).pipe(
                map(response => ({ ...data, response })),
            )),
            switchMap(data => from(data.response.text()).pipe(
                map(text => ({ ...data, text })),
            )),
            map(data => ({
                data: data.text as any,
                success: data.response.ok,
                status: data.response.status,
                headers: data.response.headers,
            })),
            catchError(error => of(this.handleError<T>(error))),
        );
    }

    public head<T>(uri: string, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Sending HEAD request', { uri, session, headers });

        return of({ uri, headers, session }).pipe(
            switchMap(data => from(session.fetch(uri, { method: 'HEAD', headers: data.headers })).pipe(
                map(response => ({ ...data, response })),
            )),
            switchMap(data => from(data.response.text()).pipe(
                map(text => ({ ...data, text })),
            )),
            map(data => ({
                data: data.text as any,
                success: data.response.ok,
                status: data.response.status,
                headers: data.response.headers,
            })),
            catchError(error => of(this.handleError<T>(error))),
        );
    }

    public options<T>(uri: string, headers?: { [key: string]: string }, session?: Session): Observable<DGTHttpResponse<T>> {
        this.logger.debug(DGTHttpSessionService.name, 'Sending OPTIONS request', { uri, session, headers });

        return of({ uri, headers, session }).pipe(
            switchMap(data => from(session.fetch(uri, { method: 'OPTIONS', headers: data.headers })).pipe(
                map(response => ({ ...data, response })),
            )),
            switchMap(data => from(data.response.text()).pipe(
                map(text => ({ ...data, text })),
            )),
            map(data => ({
                data: data.text as any,
                success: data.response.ok,
                status: data.response.status,
                headers: data.response.headers,
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
            status: error.status,
        };
    }
}
