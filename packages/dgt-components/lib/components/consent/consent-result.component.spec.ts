/* eslint-disable @typescript-eslint/no-explicit-any */
import { Purpose } from '../../models/purpose.model';
import { define } from '../../util/define';
import { ConsentResultComponent } from './consent-result.component';

const purpose: Purpose = {
  uri: 'https://purpose.uri/',
  description: 'test description',
  predicates: [ 'https://schema.org/name' ],
  icon: 'https://icon.uri/',
};

describe('ConsentResultComponent', () => {

  let component: ConsentResultComponent;

  beforeEach(() => {

    define('consent-result', ConsentResultComponent);

    component = window.document.createElement('consent-result') as ConsentResultComponent;
    component.purpose = purpose;

  });

  it('should instantiate', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(ConsentResultComponent);

  });

});
