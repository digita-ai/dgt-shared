import { ArgumentError } from '@useid/dgt-utils';
import { Alert } from './alert';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {

  let component: AlertComponent;

  beforeEach(() => {

    component = window.document.createElement('alert-component') as AlertComponent;

    (component.translator as unknown) = {
      translate: (key: string) => key,
    };

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should print message when no translator is set', async () => {

    component.alert = {
      type: 'success',
      message: 'Foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const message = window.document.body.getElementsByTagName('alert-component')[0].shadowRoot.querySelector('.message').innerHTML.replace(/<!---->/g, '');

    expect(message).toBe('Foo');

  });

  it('should translate message when translator is set and translation is found', async () => {

    component.alert = {
      type: 'success',
      message: 'foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const message = window.document.body.getElementsByTagName('alert-component')[0].shadowRoot.querySelector('.message').innerHTML.replace(/<!---->/g, '');

    expect(message).toBe(component.alert.message);

  });

  it('should not print message when translator is set but translation is not found', async () => {

    component.alert = {
      type: 'success',
      message: 'foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const message = window.document.body.getElementsByTagName('alert-component')[0].shadowRoot.querySelector('.message').innerHTML.replace(/<!---->/g, '');

    expect(message.trim()).toBe(component.alert.message);

  });

  it.each([ 'success', 'warning', 'danger' ])('should be assigned the appropriate class when %s', async (type: 'success' | 'warning' | 'danger') => {

    component.alert = {
      type,
      message: 'Foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alert = window.document.body.getElementsByTagName('alert-component')[0].shadowRoot.querySelector(`.alert.${type}`);

    expect(alert).toBeTruthy();

  });

  it('should be assigned the appropriate class when no type set', async () => {

    component.alert = {
      type: null,
      message: 'Foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alert = window.document.body.getElementsByTagName('alert-component')[0].shadowRoot.querySelector('.alert.warning');

    expect(alert).toBeTruthy();

  });

  it('should call dismiss when dismiss is clicked', async () => {

    component.alert = {
      type: 'success',
      message: 'Foo',
    };

    component.dismiss = jest.fn();
    const spy = jest.spyOn(component, 'dismiss');
    window.document.body.appendChild(component);
    await component.updateComplete;

    const dismiss = window.document.body.getElementsByTagName('alert-component')[0].shadowRoot.querySelector('.dismiss') ;

    expect(dismiss).not.toBeNull();

    dismiss.click();

    expect(spy).toHaveBeenCalledTimes(1);

  });

  it('should dispatch event when dismiss is clicked', async () => {

    component.alert = {
      type: 'success',
      message: 'Foo',
    };

    component.dispatchEvent = jest.fn();
    const spy = jest.spyOn(component, 'dispatchEvent');
    window.document.body.appendChild(component);
    await component.updateComplete;

    const dismiss = window.document.body.getElementsByTagName('alert-component')[0].shadowRoot.querySelector('.dismiss') ;

    expect(dismiss).not.toBeNull();

    dismiss.click();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(new CustomEvent<Alert>('dismiss', { detail: component.alert }));

  });

  it('should throw error when dismiss is clicked when no alert is set', async () => {

    component.alert = undefined as unknown as Alert;
    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(() => component.dismiss()).toThrow(ArgumentError);

  });

});
