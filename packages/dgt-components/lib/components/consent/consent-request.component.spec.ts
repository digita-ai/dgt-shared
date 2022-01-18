/* eslint-disable @typescript-eslint/no-explicit-any */
import { Purpose } from '../../models/purpose.model';
import { define } from '../../util/define';
import { ConsentRequestComponent } from './consent-request.component';

const purpose: Purpose = {
  uri: 'https://purpose.uri/',
  description: 'test description',
  predicates: [ 'https://schema.org/name' ],
  icon: 'https://icon.uri/',
};

describe('ConsentRequestComponent', () => {

  let component: ConsentRequestComponent;

  beforeEach(() => {

    define('consent-request', ConsentRequestComponent);

    component = window.document.createElement('consent-request') as ConsentRequestComponent;
    component.purpose = purpose;

  });

  it('should instantiate', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(ConsentRequestComponent);

  });

});
