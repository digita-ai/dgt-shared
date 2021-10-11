import SeparatorComponent from './separator.component';

describe('AppComponent', () => {

  let component: SeparatorComponent;

  beforeEach(async () => {

    component = window.document.createElement('separator-component') as SeparatorComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should create', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();

  });

});
