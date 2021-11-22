import { WebIdComponent } from './webid.component';

describe('WebIdComponent', () => {

  let component: WebIdComponent;

  beforeEach(() => {

    component = window.document.createElement('webid-form') as WebIdComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should create', async () => {

    expect(component).toBeTruthy();

  });

});
