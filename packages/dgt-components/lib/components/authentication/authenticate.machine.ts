import { DoneInvokeEvent, ErrorPlatformEvent, EventObject, MachineConfig, StateSchema } from 'xstate';
import { send, assign, log } from 'xstate/lib/actions';
import { SolidService } from '@digita-ai/inrupt-solid-service';
import { Issuer } from '../../models/issuer.model';
import { Session } from '../../models/session.model';

/**
 * Validator function for WebIDs
 *
 * @param webId The WebID to validate
 * @returns A list of validation results. An empty list means validation has passed.
 */
export type WebIdValidator = (webId: string) => Promise<string[]>;

/* CONTEXT */
export interface AuthenticateContext {
  webId?: string;
  session?: Session;
  trusted?: string[];
  issuers?: Issuer[];
  issuer?: Issuer;
  webIdValidator?: WebIdValidator;
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
  AWAITING_LOGIN   = '[AuthenticateState: Awaiting Login]',
  RETRIEVING_ISSUERS = '[AuthenticateState: Retrieving Issuers]',
  CHECKING_ISSUERS = '[AuthenticateState: Checking Issuers]',
  SELECTING_ISSUER = '[AuthenticateState: Selecting Issuer]',
  AUTHENTICATING   = '[AuthenticateState: Authenticating]',
  AUTHENTICATED    = '[AuthenticateState: Authenticated]',
  NO_TRUST         = '[AuthenticateState: No Trust]',
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
    value: AuthenticateStates.CHECKING_WEBID | AuthenticateStates.NO_TRUST | AuthenticateStates.AWAITING_LOGIN;
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
  CLICKED_LOGIN     = '[AuthenticateEvent: Clicked Login]',
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
  constructor(public message: string, public results: string[] = []) {}

}

export class SelectedIssuerEvent implements EventObject {

  public type: AuthenticateEvents.SELECTED_ISSUER = AuthenticateEvents.SELECTED_ISSUER;
  constructor(public issuer: Issuer) {}

}

export class ClickedLoginEvent implements EventObject {

  public type: AuthenticateEvents.CLICKED_LOGIN = AuthenticateEvents.CLICKED_LOGIN;
  constructor(public webId: string) {}

}

export type AuthenticateEvent =
  LoginSuccessEvent
  | WebIdEnteredEvent
  | LoginErrorEvent
  | SelectedIssuerEvent
  | ClickedLoginEvent;

/* MACHINE */

export const authenticateMachine = (solid: SolidService):
MachineConfig<AuthenticateContext, AuthenticateStateSchema, AuthenticateEvent> => ({

  initial: AuthenticateStates.CHECKING_SESSION,

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
      tags: [ 'loading' ],
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
        [AuthenticateEvents.WEBID_ENTERED]: [
          {
            // validate webId when validator is set
            cond: (context) => context.webIdValidator !== undefined,
            actions: assign({ webId: (c, event) => event.webId }),
            target: AuthenticateStates.CHECKING_WEBID,
          },
          {
            // otherwise, skip validation
            actions: assign({ webId: (c, event) => event.webId }),
            target: AuthenticateStates.AWAITING_LOGIN,
          },
        ],
        [AuthenticateEvents.SELECTED_ISSUER]: {
          actions: assign({ issuer: (context, event) => event.issuer }),
          target: AuthenticateStates.AUTHENTICATING,
        },
      },
    },

    [AuthenticateStates.CHECKING_WEBID]: {
      on: {
        [AuthenticateEvents.WEBID_ENTERED]: {
          target: AuthenticateStates.CHECKING_WEBID,
          actions: assign({ webId: (c, event) => event.webId }),
        },
      },
      invoke: {
        src: (context) => context.webIdValidator ? context.webIdValidator(context.webId) : Promise.resolve([]),
        onDone: [
          {
            cond: (c, event: DoneInvokeEvent<string[]>) => event.data?.length > 0,
            actions: send((c, event) => new LoginErrorEvent('WebID validation returned results', event.data)),
            target: AuthenticateStates.AWAITING_WEBID,
          },
          {
            target: AuthenticateStates.AWAITING_LOGIN,
          },
        ],
        onError: { actions: send((c, event) => new LoginErrorEvent('Error while validating WebID', event.data)) },
      },
    },

    [AuthenticateStates.AWAITING_LOGIN]: {
      on: {
        [AuthenticateEvents.CLICKED_LOGIN]: {
          target: AuthenticateStates.RETRIEVING_ISSUERS,
        },
        [AuthenticateEvents.WEBID_ENTERED]: {
          // validate webId when validator is set
          cond: (context) => context.webIdValidator !== undefined,
          actions: assign({ webId: (c, event) => event.webId }),
          target: AuthenticateStates.CHECKING_WEBID,
        },
      },

    },

    [AuthenticateStates.RETRIEVING_ISSUERS]: {
      tags: [ 'loading' ],
      invoke: {
        src: (context) => solid.getIssuers(context.webId),
        onDone: {
          actions: assign({ issuers: (context, event: DoneInvokeEvent<Issuer[]>) => context.trusted
            ? event.data.filter((iss) => context.trusted.includes(iss.uri))
            : event.data }),
          target: AuthenticateStates.CHECKING_ISSUERS,
        },
        onError: { actions: send((c, event: ErrorPlatformEvent) => new LoginErrorEvent(`Error retrieving issuers from WebID: ${event.data}`, [ 'common.webid-validation.no-issuer' ])) },
      },
    },

    [AuthenticateStates.CHECKING_ISSUERS]: {
      tags: [ 'loading' ],
      always: [
        {
          cond: (context) => context.issuers.length === 0,
          target: AuthenticateStates.NO_TRUST,
        },
        {
          cond: (context) => context.issuers.length === 1,
          actions: assign({ issuer: (context, event) => context.issuers[0] }),
          target: AuthenticateStates.AUTHENTICATING,
        },
        {
          target: AuthenticateStates.SELECTING_ISSUER,
        },
      ],
    },

    [AuthenticateStates.SELECTING_ISSUER]: {
      tags: [ 'loading' ],
      on: {
        [AuthenticateEvents.SELECTED_ISSUER]: {
          actions: assign({ issuer: (context, event) => event.issuer }),
          target: AuthenticateStates.AUTHENTICATING,
        },
      },
    },

    [AuthenticateStates.AUTHENTICATING]: {
      tags: [ 'loading' ],
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

    [AuthenticateStates.NO_TRUST]: {
      data: { webId: (context: AuthenticateContext) => context.webId },
      type: 'final',
    },

  },

});
