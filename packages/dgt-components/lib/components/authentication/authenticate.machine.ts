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
    issuers: [],
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
        onDone: [
          {
            cond: (context, event) => event.data.length === 1,
            actions: assign({ issuer: (context, event) => event.data[0] }),
            target: AuthenticateStates.AUTHENTICATING,
          },
          {
            actions: assign({ issuers: (context, event) => event.data.concat(context.issuers) }),
            target: AuthenticateStates.SELECTING_ISSUER,
          },
        ],
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
