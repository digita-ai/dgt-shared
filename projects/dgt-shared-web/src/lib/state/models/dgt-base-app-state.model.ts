import { DGTConnection, DGTExchange, DGTSource } from '@digita-ai/dgt-shared-data';
import { DGTI8NLocale } from '../../i8n/models/dgt-i8n-locale.model';
import { DGTNotification } from '../../interface/models/dgt-notification.model';

export interface DGTBaseAppState {
    notifications: DGTNotification[];
    locale: DGTI8NLocale;
    defaultLocale: DGTI8NLocale;
    accessToken: string;
    connections: DGTConnection<any>[];
    sources: DGTSource<any>[];
    exchanges: DGTExchange[];
}
