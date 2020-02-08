import { JWT } from '@solid/jose';

const REQUIRED_CLAIMS = ['iss', 'sub', 'aud', 'exp', 'iat'];

export class TokenClaimsSet {
    constructor({ iss, sub, aud, exp, iat, nbf, jti, auth_time, nonce, acr, amr } = {}) {
        this.iss = iss
        this.sub = sub
        this.aud = aud
        this.exp = exp
        this.iat = iat
        this.nbf = nbf
        this.jti = jti
        this.auth_time = auth_time
        this.nonce = nonce
        this.acr = acr
        this.amr = amr
    }

    validate() {
        let valid = true;
        let error = null;

        try {
            for (const claim of REQUIRED_CLAIMS) {
                if (!this[claim]) {
                    valid = false;
                    throw new Error(`Required claim ${claim} is missing.`);
                }
            }
        } catch (validationError) {
            error = validationError;
        }
        return { valid, error };
    }
}

/**
 * IDToken
 */
export class IDToken extends JWT {
    constructor(data: any = {}) {
        super(data);
        this.payload = new TokenClaimsSet(data.payload);
    }

    validate() {
        const payloadResult = this.payload.validate();
        if (!payloadResult.valid) {
            return payloadResult;
        }

        const valid = true;
        const error = null;

        return { valid, error };
    }
}
