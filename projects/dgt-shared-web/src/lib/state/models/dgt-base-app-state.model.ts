import { DGTNotification } from '../../interface/models/dgt-notification.model';
import { DGTI8NLocale } from '../../i8n/models/dgt-i8n-locale.model';

export interface DGTBaseAppState {
    notifications: Array<DGTNotification>;
    locale: DGTI8NLocale;
    defaultLocale: DGTI8NLocale;
    accessToken: string;
}
