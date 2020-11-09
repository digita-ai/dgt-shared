import { DGTConfigurationBase } from '@digita-ai/dgt-shared-utils';
import { DGTCacheType } from '@digita-ai/dgt-shared-data';

/** The configuration of the client */
export interface DGTConfigurationBaseApi extends DGTConfigurationBase {
    production: boolean;
    baseURI: string;
    enableLocalStorage: boolean;
    cache: {
        type: DGTCacheType;
        uri: string,
        prefix: string
    };
    jwt: {
        expiration: string;
        secret: string;
    };
}
