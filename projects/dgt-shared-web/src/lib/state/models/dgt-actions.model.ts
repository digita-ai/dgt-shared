import * as _ from 'lodash';
import { NavigationExtras } from '@angular/router';
import { DGTAbstractAction } from './dgt-abstract-action.model';
import { DGTAction } from './dgt-action.model';
import { DGTNotification } from '../../interface/models/dgt-notification.model';
import { DGTI8NLocale } from '../../i8n/models/dgt-i8n-locale.model';
import { DGTQuery, DGTEntity } from '@digita-ai/dgt-shared-data';

export const ActionTypes = {
  SET_LOCALE: '[App] Set locale',
  SET_DEFAULT_LOCALE: '[App] Set default locale',
  NAVIGATE: '[App] Navigate',
  NAVIGATE_EXTERNAL: '[App] Navigate external',
  LOAD_ENTITIES: '[App] Load entities',
  LOAD_ENTITIES_FINISH: '[App] Load entities finish',
  LOAD_ENTITY: '[App] Load entity',
  LOAD_ENTITY_PARENT: '[App] Load entity from parent',
  CREATE_ENTITY: '[App] Create entity',
  CREATE_ENTITY_FINISH: '[App] Create entity finish',
  LOAD_ENTITY_FINISH: '[App] Load entity finish',
  UPDATE_ENTITY: '[App] Update entity',
  UPDATE_ENTITY_FINISH: '[App] Update entity finish',
  ADD_NOTIFICATION: '[App] Add notification',
  DISMISS_NOTIFICATION: '[App] Dismiss notification',
  CHECK_CONNECTION: '[App] Check connection',
  CHECK_CONNECTION_FINISH: '[App] Check connection finish',
  HANDLE_ERROR: '[App] Handle error',
  COOKIES_NOTICE_DECISION: '[App] Cookies notice decision made',
};

export class SetLocale implements DGTAbstractAction<DGTI8NLocale> {
  type = ActionTypes.SET_LOCALE;

  constructor(public payload: DGTI8NLocale, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export class SetDefaultLocale implements DGTAbstractAction<DGTI8NLocale> {
  type = ActionTypes.SET_DEFAULT_LOCALE;

  constructor(public payload: DGTI8NLocale, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export interface NavigatePayload {
  path: any[];
  query?: object;
  extras?: NavigationExtras;
}
export class Navigate implements DGTAbstractAction<NavigatePayload> {
  type = ActionTypes.NAVIGATE;

  constructor(public payload: NavigatePayload, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) { }
}

export class NavigateExternal implements DGTAbstractAction<string> {
  type = ActionTypes.NAVIGATE_EXTERNAL;

  constructor(public payload: string, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export interface LoadEntitiesPayload {
  entityType: string;
  query?: DGTQuery;
}
export class LoadEntities implements DGTAbstractAction<LoadEntitiesPayload> {
  type = ActionTypes.LOAD_ENTITIES;

  constructor(public payload: LoadEntitiesPayload, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export interface LoadEntitiesFinishPayload {
  entityType: string;
  entities: Array<DGTEntity>;
}
export class LoadEntitiesFinish implements DGTAbstractAction<LoadEntitiesFinishPayload> {
  type = ActionTypes.LOAD_ENTITIES_FINISH;

  constructor(
    public payload: LoadEntitiesFinishPayload,
    public onSuccess: Array<DGTAction> = null,
    public onFailure: Array<DGTAction> = null) {
  }
}

export interface LoadEntityPayload {
  entityType: string;
  entityId: string;
}
export class LoadEntity implements DGTAbstractAction<LoadEntityPayload> {
  type = ActionTypes.LOAD_ENTITY;

  constructor(public payload: LoadEntityPayload, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export interface LoadEntityFinishPayload {
  entityType: string;
  entity: DGTEntity;
}
export class LoadEntityFinish implements DGTAbstractAction<LoadEntityFinishPayload> {
  type = ActionTypes.LOAD_ENTITY_FINISH;

  constructor(
    public payload: LoadEntityFinishPayload,
    public onSuccess: Array<DGTAction> = null,
    public onFailure: Array<DGTAction> = null) {
  }
}

export interface CreateEntityPayload {
  entityType: string;
  entity: DGTEntity;
}
export class CreateEntity implements DGTAbstractAction<CreateEntityPayload> {
  type = ActionTypes.CREATE_ENTITY;

  constructor(public payload: CreateEntityPayload, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export interface CreateEntityFinishPayload {
  entityType: string;
  entity: DGTEntity;
}

export class CreateEntityFinish implements DGTAbstractAction<CreateEntityFinishPayload> {
  type = ActionTypes.CREATE_ENTITY_FINISH;

  constructor(
    public payload: CreateEntityFinishPayload,
    public onSuccess: Array<DGTAction> = null,
    public onFailure: Array<DGTAction> = null) {
  }
}

export interface UpdateEntityPayload {
  entityType: string;
  entity: any;
}

export class UpdateEntity implements DGTAbstractAction<UpdateEntityPayload> {
  type = ActionTypes.UPDATE_ENTITY;

  constructor(public payload: UpdateEntityPayload, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export interface UpdateEntityFinishPayload {
  entityType: string;
  entity: DGTEntity;
}

export class UpdateEntityFinish implements DGTAbstractAction<UpdateEntityFinishPayload> {
  type = ActionTypes.UPDATE_ENTITY_FINISH;

  constructor(
    public payload: UpdateEntityFinishPayload,
    public onSuccess: Array<DGTAction> = null,
    public onFailure: Array<DGTAction> = null) {
  }
}

export class AddNotification implements DGTAbstractAction<DGTNotification> {
  type = ActionTypes.ADD_NOTIFICATION;

  constructor(public payload: DGTNotification, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export class DismissNotification implements DGTAbstractAction<string> {
  type = ActionTypes.DISMISS_NOTIFICATION;

  constructor(public payload: string, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export class CheckConnection implements DGTAbstractAction<void> {
  type = ActionTypes.CHECK_CONNECTION;
  payload = null;

  constructor(public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export class CheckConnectionFinish implements DGTAbstractAction<boolean> {
  type = ActionTypes.CHECK_CONNECTION_FINISH;

  constructor(public payload: boolean, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export interface HandleErrorPayload {
  typeName: string;
  error: Error;
  caught: any;
}

export class HandleError implements DGTAbstractAction<HandleErrorPayload> {
  type = ActionTypes.HANDLE_ERROR;

  constructor(public payload: HandleErrorPayload, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}

export class CookiesNoticeDecision implements DGTAbstractAction<boolean> {
  type = ActionTypes.COOKIES_NOTICE_DECISION;

  constructor(public payload: boolean, public onSuccess: Array<DGTAction> = null, public onFailure: Array<DGTAction> = null) {
  }
}
