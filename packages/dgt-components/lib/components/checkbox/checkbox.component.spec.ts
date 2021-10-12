import { CheckboxComponent } from './checkbox.component';

describe('CardComponent', () => {

  let component: CheckboxComponent;
  const tag = 'checkbox-component';

  beforeEach(() => {

    component = window.document.createElement(tag) as CheckboxComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should add checked to input when checked is specified', async () => {

    component.checked = true;
    window.document.body.appendChild(component);
    await component.updateComplete;

    const checkbox = window.document.body.getElementsByTagName(tag)[0].shadowRoot;

    expect(checkbox.querySelector('input')).toHaveProperty('checked', true);

  });

  it('should not add checked to input when checked is not specified', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    const checkbox = window.document.body.getElementsByTagName(tag)[0].shadowRoot;

    expect(checkbox.querySelector('input')).toHaveProperty('checked', false);

  });

});
