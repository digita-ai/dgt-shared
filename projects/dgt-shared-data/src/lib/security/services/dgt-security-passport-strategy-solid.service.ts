import { Strategy } from 'passport-strategy';
import * as jwt from 'jsonwebtoken';
import { JWT } from '@solid/jose';

/**
 * Strategy constructor
 *
 * @param options
 *          secretOrKey: String or buffer containing the secret or PEM-encoded public key. Required unless secretOrKeyProvider is provided.
 *          secretOrKeyProvider: callback in the format secretOrKeyProvider(request, rawJwtToken, done)`,
 *                               which should call done with a secret or PEM-encoded public key
 *                               (asymmetric) for the given undecoded jwt token string and  request
 *                               combination. done has the signature function done(err, secret).
 *                               REQUIRED unless `secretOrKey` is provided.
 *          jwtFromRequest: (REQUIRED) Function that accepts a reqeust as the only parameter and returns the either JWT as a string or null
 *          issuer: If defined issuer will be verified against this value
 *          audience: If defined audience will be verified against this value
 *          algorithms: List of strings with the names of the allowed algorithms. For instance, ["HS256", "HS384"].
 *          ignoreExpiration: if true do not validate the expiration of the token.
 *          passReqToCallback: If true the, the verify callback will be called with args (request, jwt_payload, done_callback).
 * @param verify - Verify callback with args (jwt_payload, done_callback) if passReqToCallback is false,
 *                 (request, jwt_payload, done_callback) if true.
 */

export class DGTSecurityPassportStrategySolidService extends Strategy {
    public name = 'solid';
    public _secretOrKeyProvider;
    public _verify;
    public _jwtFromRequest;
    public _passReqToCallback;
    public _verifOpts;

    constructor(options, verify) {
        super();

        this._secretOrKeyProvider = options.secretOrKeyProvider;

        if (options.secretOrKey) {
            if (this._secretOrKeyProvider) {
                throw new TypeError('SolidStrategy has been given both a secretOrKey and a secretOrKeyProvider');
            }
            this._secretOrKeyProvider = function (request, rawJwtToken, done) {
                done(null, options.secretOrKey)
            };
        }

        if (!this._secretOrKeyProvider) {
            throw new TypeError('SolidStrategy requires a secret or key');
        }

        this._verify = verify;
        if (!this._verify) {
            throw new TypeError('SolidStrategy requires a verify callback');
        }

        this._jwtFromRequest = options.jwtFromRequest;
        if (!this._jwtFromRequest) {
            throw new TypeError('SolidStrategy requires a function to retrieve jwt from requests (see option jwtFromRequest)');
        }

        this._passReqToCallback = options.passReqToCallback;
        var jsonWebTokenOptions = options.jsonWebTokenOptions || {};
        //for backwards compatibility, still allowing you to pass
        //audience / issuer / algorithms / ignoreExpiration
        //on the options.
        this._verifOpts = this.assign(jsonWebTokenOptions, {
            audience: options.audience,
            issuer: options.issuer,
            algorithms: options.algorithms,
            ignoreExpiration: !!options.ignoreExpiration
        });

    }
    /**
 * Allow for injection of JWT Verifier.
 *
 * This improves testability by allowing tests to cleanly isolate failures in the JWT Verification
 * process from failures in the passport related mechanics of authentication.
 *
 * Note that this should only be replaced in tests.
 */
    public JwtVerifier(token, secretOrKey, options, callback) {
        // return jwt.verify(token, secretOrKey, options, callback);
        const decoded = jwt.decode(token);

        

        callback(null, decoded);

        return decoded;
    };

    /**
     * Authenticate request based on JWT obtained from header or post body
     */
    public authenticate(req, options) {
        var token = this._jwtFromRequest(req);

        if (!token) {
            return this.fail(null, null);
        }

        this._secretOrKeyProvider(req, token, (secretOrKeyError, secretOrKey) => {
            if (secretOrKeyError) {
                this.fail(secretOrKeyError)
            } else {
                // Verify the JWT
                this.JwtVerifier(token, secretOrKey, this._verifOpts, (jwt_err, payload) => {
                    if (jwt_err) {
                        return this.fail(jwt_err);
                    } else {
                        // Pass the parsed token to the user
                        var verified = (err, user, info) => {
                            if (err) {
                                return this.error(err);
                            } else if (!user) {
                                return this.fail(info);
                            } else {
                                return this.success(user, info);
                            }
                        };

                        try {
                            if (this._passReqToCallback) {
                                this._verify(req, payload, verified);
                            } else {
                                this._verify(payload, verified);
                            }
                        } catch (ex) {
                            this.error(ex);
                        }
                    }
                });
            }
        });
    };

    private assign(target, varArgs) {
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    }
}
