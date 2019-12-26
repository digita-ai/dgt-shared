import { DGTNotification } from '../../interface/models/dgt-notification.model';
import { DGTAuthenticatedState } from '../../security/models/dgt-authenticated-state.model';
import { DGTI8NLocale } from '../../i8n/models/dgt-i8n-locale.model';
import { DGTUser } from '../../security/models/dgt-user.model';

export interface DGTBaseAppState {
    notifications: Array<DGTNotification>;
    authenticatedState: DGTAuthenticatedState;
    locale: DGTI8NLocale;
    defaultLocale: DGTI8NLocale;
    authenticatedProfile: DGTUser;
}
