/* eslint-disable @typescript-eslint/unbound-method */
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

    form = document.createElement('form');
    form.appendChild(input);

    component = window.document.createElement('webid-form') as WebIdComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should create', async () => {

    expect(component).toBeTruthy();

  });

  it('should render vertically when layout is set to vertical', async () => {

    component.layout = 'vertical';
    component.validationResults = [ 'test' ];
    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(
      component.shadowRoot.querySelector('.webid-input-container').querySelector('alert-component'),
    ).toBeDefined();

  });

  describe('onWebIdChange', () => {

    it('should dispatch change-webid CustomEvent', async () => {

      jest.useFakeTimers();
      component.dispatchEvent = jest.fn();
      component.onWebIdChange(input);
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
      } as unknown as Event & { target: HTMLFormElement });

      expect(component.dispatchEvent).toHaveBeenCalledWith(new CustomEvent('submit-webid', {
        detail: webId,
      }));

    });

  });

});
