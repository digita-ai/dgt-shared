import { EventObject, MachineConfig, StateSchema } from 'xstate';
import { send, assign, log } from 'xstate/lib/actions';
import { SolidService } from '@digita-ai/inrupt-solid-service';
import { Issuer } from '../../models/issuer.model';
import { Session } from '../../models/session.model';

/* CONTEXT */

export interface AuthenticateContext {
  webId?: string;
  session?: Session;
  issuers?: Issuer[];
  issuer?: Issuer;
}

export interface WithWebId extends AuthenticateContext {
  webId: string;
}

export interface WithIssuer extends AuthenticateContext {
  issuer: Issuer;
}

export interface WithIssuers extends AuthenticateContext {
  issuers: Issuer[];
}

export interface WithSession extends AuthenticateContext {
  session: Session;
}

/* STATES */

export enum AuthenticateStates {
  CHECKING_SESSION = '[AuthenticateState: Checking session]',
  AWAITING_WEBID   = '[AuthenticateState: Awaiting WebId]',
  CHECKING_WEBID   = '[AuthenticateState: Checking WebId]',
  SELECTING_ISSUER = '[AuthenticateState: Selecting Issuer]',
  AUTHENTICATING   = '[AuthenticateState: Authenticating]',
  AUTHENTICATED    = '[AuthenticateState: Authenticated]',
  REDIRECTING      = '[AuthenticateState: Redirecting]',
}

export interface AuthenticateStateSchema extends StateSchema<AuthenticateContext> {
  states: {
    [key in AuthenticateStates]?: StateSchema<AuthenticateContext>;
  };
}

export type AuthenticateState =
  { value: AuthenticateStates.CHECKING_SESSION | AuthenticateStates.AWAITING_WEBID;
    context: AuthenticateContext;
  } | {
    value: AuthenticateStates.CHECKING_WEBID;
    context: AuthenticateContext & WithWebId;
  } | {
    value: AuthenticateStates.SELECTING_ISSUER;
    context: AuthenticateContext & WithWebId & WithIssuers;
  } | {
    value: AuthenticateStates.AUTHENTICATING;
    context: AuthenticateContext & WithWebId & WithIssuer;
  } | {
    value: AuthenticateStates.AUTHENTICATED;
    context: AuthenticateContext & WithWebId & WithSession;
  };

/* EVENTS */

export enum AuthenticateEvents {
  WEBID_ENTERED     = '[AuthenticateEvent: WebID entered]',
  SELECTED_ISSUER   = '[AuthenticateEvent: Selected Issuer]',
  LOGIN_SUCCESS     = '[AuthenticateEvent: Login success]',
  LOGIN_ERROR       = '[AuthenticateEvent: Login error]',
}

export class WebIdEnteredEvent implements EventObject {

  public type: AuthenticateEvents.WEBID_ENTERED = AuthenticateEvents.WEBID_ENTERED;
  constructor(public webId: string) {}

}

export class LoginSuccessEvent implements EventObject {

  public type: AuthenticateEvents.LOGIN_SUCCESS = AuthenticateEvents.LOGIN_SUCCESS;

}

export class LoginErrorEvent implements EventObject {

  public type: AuthenticateEvents.LOGIN_ERROR = AuthenticateEvents.LOGIN_ERROR;
  constructor(public message: string) {}

}

export class SelectedIssuerEvent implements EventObject {

  public type: AuthenticateEvents.SELECTED_ISSUER = AuthenticateEvents.SELECTED_ISSUER;
  constructor(public issuer: Issuer) {}

}

export type AuthenticateEvent = LoginSuccessEvent | WebIdEnteredEvent | LoginErrorEvent | SelectedIssuerEvent;

/* MACHINE */

export const authenticateMachine = (solid: SolidService):
MachineConfig<AuthenticateContext, AuthenticateStateSchema, AuthenticateEvent> => ({

  initial: AuthenticateStates.CHECKING_SESSION,

  context: {
    webId: undefined,
    session: undefined,
    issuers: [
      { description: 'Solid Community', icon: 'data:image/png;base64,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', uri: 'https://solidcommunity.net' },
      { description: 'Inrupt', icon: 'https://inrupt.com/static/inrupt-social_0-372b94bf42bea86a81cc362e0c99d115.jpg', uri: 'https://inrupt.net/' },
    ],
  },

  on: {
    [AuthenticateEvents.LOGIN_ERROR]: {
      actions: [
        log((context, event) => `Login error:`),
        log((context, event) => event),
      ],
      target: AuthenticateStates.AWAITING_WEBID,
    },
  },

  states: {

    [AuthenticateStates.CHECKING_SESSION]: {
      invoke: {
        src: () => solid.getSession(),
        onDone: {
          actions: assign({ session: (context, event) => event.data }),
          target: AuthenticateStates.AUTHENTICATED,
        },
        onError: AuthenticateStates.AWAITING_WEBID,
      },
    },

    [AuthenticateStates.AWAITING_WEBID]: {
      on: {
        [AuthenticateEvents.WEBID_ENTERED]: {
          actions: assign({ webId: (context, event) => event.webId }),
          target: AuthenticateStates.CHECKING_WEBID,
        },
        [AuthenticateEvents.SELECTED_ISSUER]: {
          actions: assign({ issuer: (context, event) => event.issuer }),
          target: AuthenticateStates.AUTHENTICATING,
        },
      },
    },

    [AuthenticateStates.CHECKING_WEBID]: {
      invoke: {
        src: (context) => solid.getIssuers(context.webId),
        onDone: {
          actions: assign({ issuers: (context, event) => event.data.concat(context.issuers) }),
          target: AuthenticateStates.SELECTING_ISSUER,
        },
        onError: { actions: send((context, event) => new LoginErrorEvent('Invalid WebID')) },
      },
    },

    [AuthenticateStates.SELECTING_ISSUER]: {
      on: {
        [AuthenticateEvents.SELECTED_ISSUER]: {
          actions: assign({ issuer: (context, event) => event.issuer }),
          target: AuthenticateStates.AUTHENTICATING,
        },
      },
    },

    [AuthenticateStates.AUTHENTICATING]: {
      invoke: {
        src: (context) => solid.loginWithIssuer(context.issuer),
        onError: {
          actions: send((context, event) => new LoginErrorEvent('Login failed')),
        },
      },
    },

    [AuthenticateStates.AUTHENTICATED]: {
      data: { session: (context: AuthenticateContext) => context.session },
      type: 'final',
    },

  },

});
