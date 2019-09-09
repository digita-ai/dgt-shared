import { User } from 'firebase';
import { DGTProfile } from '../../domain/models/dgt-profile.model';
import { DGTBaseAppState } from '@digita/dgt-shared-web';

export interface DGTFirebaseBaseAppState extends DGTBaseAppState {
    authenticatedUser: User;
    authenticatedProfile: DGTProfile;
    profileList: Array<DGTProfile>;
}
