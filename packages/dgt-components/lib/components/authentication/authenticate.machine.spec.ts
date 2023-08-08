/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMachine, interpret, Interpreter, StateMachine } from 'xstate';
import { SolidService } from '@useid/inrupt-solid-service';
import { Issuer } from '../../models/issuer.model';
import { AuthenticateContext, AuthenticateEvent, authenticateMachine, AuthenticateState, AuthenticateStates, AuthenticateStateSchema, ClickedLoginEvent, WebIdEnteredEvent } from './authenticate.machine';

describe('AuthenticateMachine', () => {

  let actor: Interpreter<AuthenticateContext, AuthenticateStateSchema, AuthenticateEvent, AuthenticateState>;
  let machine: StateMachine<AuthenticateContext, AuthenticateStateSchema, AuthenticateEvent, AuthenticateState>;

  const solidService = {
    getSession: jest.fn(async () => { throw new Error(); }), // mock failing of session restore
    getIssuers: jest.fn(async () => []),
    loginWithIssuer: jest.fn(),
  } as unknown as SolidService;

  const mockIssuer: Issuer = {
    icon: 'https://issuer.uri/icon.png',
    description: 'Issuer description',
    uri: 'https://issuer.uri/',
  };

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

      const prom = new Promise<void>((resolve) => {

        actor.onTransition((state) => {

          if (state.matches(AuthenticateStates.NO_TRUST)) {

            resolve();

          }

        });

      });

      solidService.getIssuers = jest.fn(async () => []);
      actor.start();

      await expect(prom).resolves.toBeUndefined();
      expect(actor.state.context.issuers).toHaveLength(0);

    });

    it('should transition to AUTHENTICATING when single issuer', async () => {

      const prom = new Promise<void>((resolve) => {

        actor.onTransition((state) => {

          if (state.matches(AuthenticateStates.AUTHENTICATING)) {

            resolve();

          }

        });

      });

      jest.spyOn(solidService, 'getIssuers').mockResolvedValueOnce([ mockIssuer ]);
      actor.start();

      await expect(prom).resolves.toBeUndefined();
      expect(actor.state.context.issuers).toHaveLength(1);
      expect(actor.state.context.issuer).toBe(mockIssuer);

    });

    it('should transition to SELECTING_ISSUER when multiple issuers', async () => {

      const prom = new Promise<void>((resolve) => {

        actor.onTransition((state) => {

          if (state.matches(AuthenticateStates.SELECTING_ISSUER)) {

            resolve();

          }

        });

      });

      jest.spyOn(solidService, 'getIssuers').mockResolvedValueOnce([ mockIssuer, mockIssuer ]);
      actor.start();

      await expect(prom).resolves.toBeUndefined();
      expect(actor.state.context.issuers?.length).toBeGreaterThan(1);

    });

  });

});
