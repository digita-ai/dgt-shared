import { DGTErrorArgument, DGTHttpService, DGTLoggerService } from '@digita/dgt-shared-utils';
import { Injectable } from '@angular/core';
import { Observable, of, pipe } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/**
 * Validator for all things solid-related
 */
@Injectable()
export class DGTSourceSolidValidator {

    constructor(
        private http: DGTHttpService,
        private logger: DGTLoggerService
    ) { }

    /**
     * Check if a solid server is running on the given url
     * @param url url to test
     * @returns true if the specified url is a solid server, false if not
     */
    public isSolidServer(url: string): Observable<boolean> {
        if (!url) {
            this.logger.debug(DGTSourceSolidValidator.name, 'URL was undefined or null', url);
            return of(false);
        }
        // Test if url is valid
        // Copyright (c) 2010-2018 Diego Perini (http://www.iport.it)
        const reg = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
        if (!reg.test(url)) {
            this.logger.debug(DGTSourceSolidValidator.name, 'URL was not valid', url);
            return of(false);
        } else {
            // Check headers for Link
            return this.http.head(url).pipe(
                map(res => {
                        const headers = res.headers;
                        if (res.status !== 200) {
                            this.logger.debug(DGTSourceSolidValidator.name, 'Status was not 200', res.status);
                            return false;
                        } else if (!headers.has('link')) {
                            this.logger.debug(DGTSourceSolidValidator.name, 'Headers did not contain Link', headers);
                            return false;
                        } else if (headers.get('link') !== '<.acl>; rel="acl", <.meta>; rel="describedBy", <http://www.w3.org/ns/ldp#Resource>; rel="type"') {
                            this.logger.debug(DGTSourceSolidValidator.name, 'Link header value did not match', headers.get('link'));
                            return false;
                        } else {
                            return true;
                        }
                    })
            )
            &&
            // Check if /.well-known/openid-configuration exists on server
            this.http.get(url + '/.well-known/openid-configuration').pipe(
                map(getRes => {
                if (getRes.status !== 200) {
                    this.logger.debug(DGTSourceSolidValidator.name, 'Status was not 200', getRes.status);
                    return false;
                } else {
                    this.logger.debug(DGTSourceSolidValidator.name, 'URL has a solid server', url);
                    // When the url passes all of the previous checks, it is granted 'solid-server' status and awarded a small applause
                    return true;
                }
                })
            );
        }
    }
}

// {
//     const headers = res.headers;
//     if (res.status !== 200) {
//         this.logger.debug(DGTSourceSolidValidator.name, 'Status was not 200', res.status);
//         return of(false);
//     } else if (!headers.has('link')) {
//         this.logger.debug(DGTSourceSolidValidator.name, 'Headers did not contain Link', headers);
//         return of(false);
//     } else if (headers.get('link') !== '<.acl>; rel="acl", <.meta>; rel="describedBy", <http://www.w3.org/ns/ldp#Resource>; rel="type"') {
//         this.logger.debug(DGTSourceSolidValidator.name, 'Link header value did not match', headers.get('link'));
//         return of(false);
//     } else {
//         // Check if .well-known/solid-configuration exists on server
//         this.http.get(url + '/.well-known/openid-configuration').subscribe(getRes => {
//             if (getRes.status !== 200) {
//                 this.logger.debug(DGTSourceSolidValidator.name, 'Status was not 200', getRes.status);
//                 return of(false);
//             } else {
//                 this.logger.debug(DGTSourceSolidValidator.name, 'URL has a solid server', url);
//                 // When the url passes all of the previous checks, it is granted 'solid-server' status and awarded a small applause
//                 return of(true);
//             }
//         });
//     }
// }
