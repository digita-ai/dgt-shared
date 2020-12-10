import { DGTConfigurationBase } from '@digita-ai/dgt-shared-utils';
import { DGTCacheType } from '../../cache/models/DGTCacheType.model';

/** The configuration of the client */
export interface DGTConfigurationBaseApi extends DGTConfigurationBase {
    production: boolean;
    baseURI: string;
    enableLocalStorage: boolean;
    cache: {
        type: DGTCacheType;
        uri: string,
        prefix: string
        sparqlEndpoint: string
    };
    jwt: {
        expiration: string;
        secret: string;
    };
}
