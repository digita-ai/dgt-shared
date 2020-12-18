import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import * as url from 'url';

@DGTInjectable()
export class DGTSecurityPassportStrategySolidJWTExtractorService {

    // Note: express http converts all headers
    // to lower case.
    private readonly AUTH_HEADER = 'authorization';
    private readonly LEGACY_AUTH_SCHEME = 'JWT';
    private readonly BEARER_AUTH_SCHEME = 'bearer';

    public fromHeader(header_name) {
        return (request) => {
            let token = null;
            if (request.headers[header_name]) {
                token = request.headers[header_name];
            }
            return token;
        };
    };

    public fromBodyField(field_name) {
        return (request) => {
            let token = null;
            if (request.body && Object.prototype.hasOwnProperty.call(request.body, field_name)) {
                token = request.body[field_name];
            }
            return token;
        };
    };

    public fromUrlQueryParameter(param_name) {
        return (request) => {
            let token = null;
            const parsed_url = url.parse(request.url, true);
            if (parsed_url.query && Object.prototype.hasOwnProperty.call(parsed_url.query, param_name)) {
                token = parsed_url.query[param_name];
            }
            return token;
        };
    };

    public fromAuthHeaderWithScheme(auth_scheme) {
        const auth_scheme_lower = auth_scheme.toLowerCase();
        return (request) => {

            let token = null;
            if (request.headers[this.AUTH_HEADER]) {
                const auth_params = this.parseAuthHeader(request.headers[this.AUTH_HEADER]);
                if (auth_params && auth_scheme_lower === auth_params.scheme.toLowerCase()) {
                    token = auth_params.value;
                }
            }
            return token;
        };
    };

    public fromAuthHeaderAsBearerToken() {
        return this.fromAuthHeaderWithScheme(this.BEARER_AUTH_SCHEME);
    };

    public fromExtractors(extractors) {
        if (!Array.isArray(extractors)) {
            throw new TypeError('extractors.fromExtractors expects an array')
        }

        return (request) => {
            let token = null;
            let index = 0;
            while (!token && index < extractors.length) {
                token = extractors[index].call(this, request);
                index++;
            }
            return token;
        }
    };

    /**
     * This extractor mimics the behavior of the v1.*.* extraction logic.
     *
     * This extractor exists only to provide an easy transition from the v1.*.* API to the v2.0.0
     * API.
     *
     * This extractor first checks the auth header, if it doesn't find a token there then it checks the
     * specified body field and finally the url query parameters.
     *
     * @param options
     *          authScheme: Expected scheme when JWT can be found in HTTP Authorize header. Default is JWT.
     *          tokenBodyField: Field in request body containing token. Default is auth_token.
     *          tokenQueryParameterName: Query parameter name containing the token. Default is auth_token.
     */
    public versionOneCompatibility(options) {
        const authScheme = options.authScheme || this.LEGACY_AUTH_SCHEME,
            bodyField = options.tokenBodyField || 'auth_token',
            queryParam = options.tokenQueryParameterName || 'auth_token';

        return (request) => {
            const authHeaderExtractor = this.fromAuthHeaderWithScheme(authScheme);
            let token = authHeaderExtractor(request);

            if (!token) {
                const bodyExtractor = this.fromBodyField(bodyField);
                token = bodyExtractor(request);
            }

            if (!token) {
                const queryExtractor = this.fromUrlQueryParameter(queryParam);
                token = queryExtractor(request);
            }

            return token;
        };
    }

    private parseAuthHeader(hdrValue) {
        const re = /(\S+)\s+(\S+)/;
        if (typeof hdrValue !== 'string') {
            return null;
        }
        const matches = hdrValue.match(re);
        return matches && { scheme: matches[1], value: matches[2] };
    }
}
