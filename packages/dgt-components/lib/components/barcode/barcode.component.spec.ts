import { BarcodeComponent } from './barcode.component';

describe('BarcodeComponent', () => {

  let component: BarcodeComponent;
  const tag = 'barcode-component';

  beforeEach(() => {

    component = window.document.createElement(tag) as BarcodeComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

});
