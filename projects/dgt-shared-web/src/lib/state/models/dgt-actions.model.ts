import { NavigationExtras } from '@angular/router';
import * as _ from 'lodash';
import { DGTI8NLocale } from '../../i8n/models/dgt-i8n-locale.model';
import { DGTNotification } from '../../interface/models/dgt-notification.model';
import { DGTAbstractAction } from './dgt-abstract-action.model';
import { DGTAction } from './dgt-action.model';

export const ActionTypes = {
  SET_LOCALE: '[App] Set locale',
  SET_DEFAULT_LOCALE: '[App] Set default locale',
  NAVIGATE: '[App] Navigate',
  NAVIGATE_EXTERNAL: '[App] Navigate external',
  ADD_NOTIFICATION: '[App] Add notification',
  DISMISS_NOTIFICATION: '[App] Dismiss notification',
  DISMISS_ALL_NOTIFICATIONS: '[App] Dismiss all notifications',
  CHECK_CONNECTION: '[App] Check connection',
  CHECK_CONNECTION_FINISH: '[App] Check connection finish',
  CHECK_UPDATES: '[App] Check updates',
  HANDLE_ERROR: '[App] Handle error',
  COOKIES_NOTICE_DECISION: '[App] Cookies notice decision made',
  NGRX_NAVIGATED: '@ngrx/router-store/navigated',
};

export class SetLocale implements DGTAbstractAction<DGTI8NLocale> {
  type = ActionTypes.SET_LOCALE;

  constructor(public payload: DGTI8NLocale, public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}

export class SetDefaultLocale implements DGTAbstractAction<DGTI8NLocale> {
  type = ActionTypes.SET_DEFAULT_LOCALE;

  constructor(public payload: DGTI8NLocale, public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}

export interface NavigatePayload {
  path: any[];
  query?: object;
  extras?: NavigationExtras;
}
export class Navigate implements DGTAbstractAction<NavigatePayload> {
  type = ActionTypes.NAVIGATE;

  constructor(public payload: NavigatePayload, public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) { }
}

export class NavigateExternal implements DGTAbstractAction<string> {
  type = ActionTypes.NAVIGATE_EXTERNAL;

  constructor(public payload: string, public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}

export class AddNotification implements DGTAbstractAction<DGTNotification> {
  type = ActionTypes.ADD_NOTIFICATION;

  constructor(public payload: DGTNotification, public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}

export class DismissNotification implements DGTAbstractAction<string> {
  type = ActionTypes.DISMISS_NOTIFICATION;

  constructor(public payload: string, public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}

export class CheckUpdates implements DGTAbstractAction<void> {
  type = ActionTypes.CHECK_UPDATES;
  payload = null;

  constructor(public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}

export class CheckConnection implements DGTAbstractAction<void> {
  type = ActionTypes.CHECK_CONNECTION;
  payload = null;

  constructor(public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}

export class CheckConnectionFinish implements DGTAbstractAction<boolean> {
  type = ActionTypes.CHECK_CONNECTION_FINISH;

  constructor(public payload: boolean, public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}

export interface HandleErrorPayload {
  typeName: string;
  error: Error;
  caught: any;
}

export class HandleError implements DGTAbstractAction<HandleErrorPayload> {
  type = ActionTypes.HANDLE_ERROR;

  constructor(public payload: HandleErrorPayload, public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}

export class CookiesNoticeDecision implements DGTAbstractAction<boolean> {
  type = ActionTypes.COOKIES_NOTICE_DECISION;

  constructor(public payload: boolean, public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}

export class DismissAllNotifications implements DGTAbstractAction<{}> {
  type = ActionTypes.DISMISS_ALL_NOTIFICATIONS;
  constructor(public payload: {}, public onSuccess: DGTAction[] = null, public onFailure: DGTAction[] = null) {
  }
}
