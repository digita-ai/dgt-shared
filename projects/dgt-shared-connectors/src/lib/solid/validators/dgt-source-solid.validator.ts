import { DGTErrorArgument, DGTHttpService, DGTLoggerService } from '@digita/dgt-shared-utils';
import { Injectable } from '@angular/core';

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
     * @param url url of the solid server to test
     * @returns true if the specified url is a solid server, false if not
     * @throws DGTErrorArgument if url is invalid or server does not return 200
     */
    public isSolidServer(url: string): boolean {
        if (!url) {
            throw new DGTErrorArgument('Passed url is null or undefined', url);
        }
        // Check headers for Link
        this.http.head(url).subscribe(res => {
            const headers = res.headers;
            if (res.status !== 200) {
                this.logger.debug(DGTSourceSolidValidator.name, 'Status was not 200', res.status);
                return false;
            }
            if (!headers.has('link')) {
                this.logger.debug(DGTSourceSolidValidator.name, 'Headers did not contain Link', headers);
                return false;
            }
            if (headers.get('link') !== '<.acl>; rel="acl", <.meta>; rel="describedBy", <http://www.w3.org/ns/ldp#Resource>; rel="type"') {
                this.logger.debug(DGTSourceSolidValidator.name, 'Link header value did not match', headers.get('link'));
                return false;
            }
        });
        // Check if .well-known/solid-configuration exists on server
        this.http.get(url + '/.well-known/openid-configuration').subscribe(res => {
            if (res.status !== 200) {
                this.logger.debug(DGTSourceSolidValidator.name, 'Status was not 200', res.status);
                return false;
            }
        });

        this.logger.debug(DGTSourceSolidValidator.name, 'URL has a solid server', url);
        // When the url passes all of the previous checks, it is officially granted 'solid-server' status and a small applause
        return true;
    }
}
