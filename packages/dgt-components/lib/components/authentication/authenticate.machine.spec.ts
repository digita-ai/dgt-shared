/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMachine, interpret, Interpreter, StateMachine } from 'xstate';
import { AuthenticateContext, AuthenticateEvent, authenticateMachine, AuthenticateState, AuthenticateStates, AuthenticateStateSchema, ClickedLoginEvent, WebIdEnteredEvent } from './authenticate.machine';

describe('AuthenticateMachine', () => {

  let actor: Interpreter<AuthenticateContext, AuthenticateStateSchema, AuthenticateEvent, AuthenticateState>;
  let machine: StateMachine<AuthenticateContext, AuthenticateStateSchema, AuthenticateEvent, AuthenticateState>;

  const solidService = {
    getSession: jest.fn(async () => { throw new Error(); }), // mock failing of session restore
    getIssuers: jest.fn(async () => []),
  } as any;

  beforeEach(() => {

    machine = createMachine(authenticateMachine(solidService)).withContext({});
    actor = interpret(machine);

  });

  describe('CHECKING_ISSUERS', () => {

    beforeEach(async () => {

      // go to CHECKING_ISSUERS state
      actor.onTransition((state) => {

        if (state.matches(AuthenticateStates.AWAITING_WEBID)) {

          // go to AWAITING_LOGIN state
          actor.send(new WebIdEnteredEvent('https://example.com/profile/card#me'));

        } else if (state.matches(AuthenticateStates.AWAITING_LOGIN)) {

          // go to RETRIEVING_ISSUERS state
          actor.send(new ClickedLoginEvent('https://example.com/profile/card#me'));

        }

      });

    });

    it('should transition to NO_TRUST when issuers is empty', async () => {

      solidService.getIssuers = jest.fn(async () => []);

      actor.onTransition((state) => {

        if (state.matches(AuthenticateStates.NO_TRUST)) {

          expect(state.context.issuers.length).toEqual(0);

        }

      });

      actor.start();

    });

    it('should transition to AUTHENTICATING when single issuer', async () => {

      solidService.getIssuers = jest.fn(async () => [ 'https://issuer.uri/' ]);

      actor.onTransition((state) => {

        if (state.matches(AuthenticateStates.AUTHENTICATING)) {

          expect(state.context.issuers.length).toEqual(1);
          expect(state.context.issuer).toEqual('https://issuer.uri/');

        }

      });

      actor.start();

    });

    it('should transition to SELECTING_ISSUER when multiple issuers', async () => {

      solidService.getIssuers = jest.fn(async () => [ 'https://issuer1.uri/', 'https://issuer2.uri/' ]);

      actor.onTransition((state) => {

        if (state.matches(AuthenticateStates.SELECTING_ISSUER)) {

          expect(state.context.issuers.length).toBeGreaterThan(1);

        }

      });

      actor.start();

    });

  });

});
