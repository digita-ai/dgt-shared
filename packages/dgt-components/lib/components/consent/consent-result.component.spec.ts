/* eslint-disable @typescript-eslint/no-explicit-any */
import { define } from '../../util/define';
import { ConsentResultComponent } from './consent-result.component';

describe('ConsentResultComponent', () => {

  let component: ConsentResultComponent;

  beforeEach(() => {

    define('consent-result', ConsentResultComponent);

    component = window.document.createElement('consent-result') as ConsentResultComponent;

  });

  it('should instantiate', async () => {

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(ConsentResultComponent);

  });

});
