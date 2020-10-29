import { DGTConfigurationBase } from '@digita-ai/dgt-shared-utils';

/** The configuration of the client */
export interface DGTConfigurationBaseWeb extends DGTConfigurationBase {
    locale: {
        default: string,
        mapping: {
            domain: string,
            locale: string,
            language: string,
            country: string
        }[]
    };
    server: {
        uri: string,
    };
    events: {
        file: string,
        templates: any
    };
}
