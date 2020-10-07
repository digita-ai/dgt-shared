import { DGTConfigurationBase } from '@digita-ai/dgt-shared-utils';
import { DGTEvent } from '../../events/models/dgt-event.model';

/** The configuration of the client */
export interface DGTConfigurationBaseWeb extends DGTConfigurationBase {
    typeRegistrations?: {
        [key: string]: string;
    };
    locale: {
        default: string,
        mapping: {
            domain: string,
            locale: string,
            language: string,
            country: string
        }[]
    };
    events: {
        file: string,
        templates: {
            eventsLoaded: DGTEvent,
            profileLoaded: DGTEvent,
            valuesUpdated: DGTEvent,
        }
    };
}
