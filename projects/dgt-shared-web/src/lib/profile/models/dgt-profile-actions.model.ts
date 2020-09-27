import { DGTProfile, DGTConnectionSolid, DGTSourceSolid } from '@digita/dgt-shared-data';
import { DGTAbstractAction } from '../../state/models/dgt-abstract-action.model';
import { DGTAction } from '../../state/models/dgt-action.model';

export const DGTProfileActionTypes = {
  LOAD_PROFILE: '[App] Load profile',
  LOAD_PROFILE_FINISHED: '[App] Load profile finished',
};

export interface DGTProfileLoadPayload {
  connection: DGTConnectionSolid,
  source: DGTSourceSolid,
}

export class DGTProfileLoad implements DGTAbstractAction<DGTProfileLoadPayload> {
  type = DGTProfileActionTypes.LOAD_PROFILE;

  constructor(public payload: DGTProfileLoadPayload, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) { }
}

export interface DGTProfileLoadFinishedPayload {
  connection: DGTConnectionSolid,
  source: DGTSourceSolid,
  profile: DGTProfile,
}

export class DGTProfileLoadFinished implements DGTAbstractAction<DGTProfileLoadFinishedPayload> {
  type = DGTProfileActionTypes.LOAD_PROFILE_FINISHED;

  constructor(public payload: DGTProfileLoadFinishedPayload,
              public onSuccess: Array<DGTAction> = null,
              public onFailure: Array<DGTAction> = null) { }
}