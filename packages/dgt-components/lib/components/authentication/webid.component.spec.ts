/* eslint-disable @typescript-eslint/no-explicit-any */
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

      component.dispatchEvent = jest.fn();

      component.onWebIdChange({
        preventDefault: jest.fn(),
        target: input,
      } as any);

      expect(component.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));

      expect(component.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        type: 'change-webid',
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

      expect(component.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));

      expect(component.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        type: 'submit-webid',
        detail: webId,
      }));

    });

  });

});
