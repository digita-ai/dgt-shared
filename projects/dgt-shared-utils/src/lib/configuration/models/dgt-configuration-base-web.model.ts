import { DGTConfigurationBase } from './dgt-configuration-base.model';

/** The configuration of the client */
export interface DGTConfigurationBaseWeb extends DGTConfigurationBase {
    enableServiceWorker: boolean;
    typeRegistrations?: {
        [key: string]: string;
    };
    locale: {
        default: string,
        mapping: {
            domain: string,
            locale: string,
            language: string,
            country: string,
        }[],
    };
    server: {
        uri: string,
    };
    events: {
        file: string,
        templates: any,
    };
}
