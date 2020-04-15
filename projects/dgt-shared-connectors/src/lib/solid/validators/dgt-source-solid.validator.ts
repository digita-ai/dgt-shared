import { DGTErrorArgument, DGTHttpService } from '@digita/dgt-shared-utils';
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

/**
 * Validator for all things solid-related
 */
@Injectable()
export class DGTSourceSolidValidator {

    constructor(
        private http: DGTHttpService
    ) { }

    /**
     * Check if a solid server is running on an url
     * @param url url of the solid server to test
     * @returns true if the specified url is a solid server, false if not
     * @throws DGTErrorArgument if url is invalid or server does not return 200
     */
    public isSolidServer(url: string): boolean {
        if (!url) {
            throw new DGTErrorArgument('url is null or undefined', url);
        }
        // Check if url is valid
        // Copyright (c) 2010-2018 Diego Perini (http://www.iport.it)

        const regex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

        if (regex.test(url)) {
            // Check if url has solid-server header
            let headers: HttpHeaders;
            this.http.head(url).subscribe(res => {
                if (res.status !== 200) {
                    return false;
                }
                headers = res.headers;
                return headers.has('X-Powered-By') && /solid-server\/.*/.test(headers.get('X-Powered-By'));
            });

        } else {
            return false;
        }
    }
}
