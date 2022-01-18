/* eslint-disable @typescript-eslint/no-explicit-any */
import { define } from '../../util/define';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {

  let component: LoadingComponent;

  beforeEach(() => {

    define('loading-component', LoadingComponent);

    component = window.document.createElement('loading-component') as LoadingComponent;

  });

  it('should instantiate', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(LoadingComponent);

  });

});
