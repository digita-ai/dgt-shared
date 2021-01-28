import { DGTCacheType } from '../../cache/models/dgt-cache-type.model';
import { DGTConfigurationBase } from './dgt-configuration-base.model';

/** The configuration of the client */
export interface DGTConfigurationBaseApi extends DGTConfigurationBase {
    production: boolean;
    baseURI: string;
    enableLocalStorage: boolean;
    publicURI: string;
    cache: {
        type: DGTCacheType;
        uri: string;
        prefix: string;
        sparqlEndpoint: string;
    };
    jwt: {
        expiration: string;
        secret: string;
    };
    connectorTypeSolid: string;
}
