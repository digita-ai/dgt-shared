import { DGTBaseAppState } from '@digita-ai/dgt-shared-web';
import { User } from 'firebase';
import { DGTProfile } from '../../domain/models/dgt-profile.model';

export interface DGTFirebaseBaseAppState extends DGTBaseAppState {
    authenticatedUser: User;
    authenticatedProfile: DGTProfile;
    profileList: DGTProfile[];
}
