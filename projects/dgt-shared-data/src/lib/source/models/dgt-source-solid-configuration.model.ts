export interface DGTSourceSolidConfiguration {

    // IDP Discovery
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    jwks_uri: string;
    registration_endpoint: string;
    response_types_supported: string[];
    response_modes_supported: string[];
    grant_types_supported: string[];
    subject_types_supported: string[];
    id_token_signing_alg_values_supported: string[];
    token_endpoint_auth_methods_supported: string[];
    token_endpoint_auth_signing_alg_values_supported: string[];
    display_values_supported: string[];
    claim_types_supported: string[];
    claims_supported: string[];
    claims_parameter_supported: boolean;
    request_parameter_supported: boolean;
    request_uri_parameter_supported: boolean;
    require_request_uri_registration: boolean;
    check_session_iframe: string;
    end_session_endpoint: string;

    // Client registration
    callbackUri: string;
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
    response_types: string[];
    grant_types: string[];
    application_type: string;
    client_name: string;
    logo_uri: string;
    client_uri: string;
    id_token_signed_response_alg: string;
    token_endpoint_auth_method: string;
    default_max_age: number;
    post_logout_redirect_uris: string[];
    frontchannel_logout_session_required: boolean;
    registration_access_token: string;
    registration_client_uri: string;
    client_id_issued_at: number;
    client_secret_expires_at: number;

    // Key configuration
    keys: {
        kid: string,
        kty: string,
        alg: string,
        n: string,
        e: string,
        key_ops: string[],
        ext: boolean
    }[];
}
