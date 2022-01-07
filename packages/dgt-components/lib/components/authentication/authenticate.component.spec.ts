/* eslint-disable @typescript-eslint/dot-notation */
import { define } from '../../util/define';
import { hydrate } from '../../util/hydrate';
import { AuthenticateComponent } from './authenticate.component';
import { ClickedLoginEvent, WebIdEnteredEvent } from './authenticate.machine';

describe('AuthenticateComponent', () => {

  let component: AuthenticateComponent;

  const solidService = {
    getSession: jest.fn(async () => 'https://web.id/'),
  };

  beforeEach(() => {

    define('authenticate-component', hydrate(AuthenticateComponent)(solidService));
    component = window.document.createElement('authenticate-component') as AuthenticateComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should instantiate', async () => {

    expect(component).toBeTruthy();

  });

  describe('onSubmit', () => {

    it('should send ClickedLoginEvent to actor', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      const webId = 'https://web.id/';
      component['actor'].send = jest.fn();
      component.onSubmit(new CustomEvent('submit-webid', { detail: webId }));

      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedLoginEvent(webId));

    });

  });

  describe('onWebIdChange', () => {

    it('should send WebIdEnteredEvent to actor', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      const webId = 'https://web.id/';
      component['actor'].send = jest.fn();
      component.onWebIdChange(new CustomEvent('change-webid', { detail: webId }));

      expect(component['actor'].send).toHaveBeenCalledWith(new WebIdEnteredEvent(webId));

    });

  });

});
