/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from '../alerts/alert';
import { WebIdComponent } from './webid.component';

describe('WebIdComponent', () => {

  let component: WebIdComponent;
  const webId = 'https://web.id/';

  let input: HTMLInputElement;
  let form: HTMLFormElement;

  beforeEach(() => {

    input = document.createElement('input');
    input.value = webId;
    input.name = 'webid';

    form =  document.createElement('form');
    form.appendChild(input);

    component = window.document.createElement('webid-form') as WebIdComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should create', async () => {

    expect(component).toBeTruthy();

  });

  describe('onWebIdChange', () => {

    it('should dispatch change-webid CustomEvent', async () => {

      jest.useFakeTimers();

      component.dispatchEvent = jest.fn();

      component.onWebIdChange({
        preventDefault: jest.fn(),
        target: input,
      } as any);

      jest.advanceTimersByTime(500);

      expect(component.dispatchEvent).toHaveBeenCalledWith(new CustomEvent('change-webid', {
        detail: webId,
      }));

    });

  });

  describe('onSubmit', () => {

    it('should dispatch submit-webid CustomEvent', async () => {

      component.dispatchEvent = jest.fn();

      component.onSubmit({
        preventDefault: jest.fn(),
        target: form,
      } as any);

      expect(component.dispatchEvent).toHaveBeenCalledWith(new CustomEvent('submit-webid', {
        detail: webId,
      }));

    });

  });

});
