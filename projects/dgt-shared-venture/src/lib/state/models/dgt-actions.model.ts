import * as _ from 'lodash';
import { User } from 'firebase';
import { DGTProfile } from '../../domain/models/dgt-profile.model';
import { DGTAbstractAction, DGTAction } from '@digita-ai/dgt-shared-web';

export const ActionTypes = {
  SET_USER: '[App] Set user',
  SET_PROFILE: '[App] Set profile',
};

export class SetUser implements DGTAbstractAction<User> {
  type = ActionTypes.SET_USER;

  constructor(public payload: User, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export class SetProfile implements DGTAbstractAction<DGTProfile> {
  type = ActionTypes.SET_PROFILE;

  constructor(public payload: DGTProfile, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}
