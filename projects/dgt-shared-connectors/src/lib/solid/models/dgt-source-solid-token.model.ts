import { JWT, JWK } from '@solid/jose';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { URL } from 'whatwg-url';

const DEFAULT_MAX_AGE = 3600; // Default token expiration, in seconds

export class DGTSourceSolidToken extends JWT {

    constructor(data: any, other: any) {
        super(data, other);
    }

    static issueFor(resourceServerUri, sessionKey: string, clientId: string, idToken: string): Observable<any> {
        const jwk = JSON.parse(sessionKey);

        return from(JWK.importKey(jwk))
            .pipe(
                map(importedSessionJwk => {
                    const options = {
                        aud: (new URL(resourceServerUri)).origin,
                        key: importedSessionJwk,
                        iss: clientId,
                        idToken
                    };

                    return DGTSourceSolidToken.issue(options);
                }),
                switchMap((jwt: any) => from(jwt.encode()))
            );
    }

    static issue(options) {
        const { aud, iss, key } = options;

        const alg = key.alg;
        const iat = options.iat || Math.floor(Date.now() / 1000);
        const max = options.max || DEFAULT_MAX_AGE;

        const exp = iat + max; // token expiration

        const header = { alg };
        const payload = { iss, aud, exp, iat, id_token: options.idToken, token_type: 'pop' };

        // const jwt = new DGTSourceSolidToken({ header, payload, key: key.cryptoKey });
        const jwt = new DGTSourceSolidToken({ header, payload, key: key.cryptoKey }, { filter: false });

        return jwt;
    }
}
