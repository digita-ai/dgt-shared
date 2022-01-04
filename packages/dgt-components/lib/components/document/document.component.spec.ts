import { DocumentComponent } from './document.component';

describe('DocumentComponent', () => {

  let component: DocumentComponent;

  beforeEach(() => {

    component = window.document.createElement('document-component') as DocumentComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should error when no event was provided', () => {

    expect(() => component.handleResponse(null)).toThrowError('Argument event || !event.detail || !event.detail.data should be set.');

  });

});
