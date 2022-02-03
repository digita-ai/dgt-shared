import { define } from '../../util/define';
import { SourceComponent } from './source.component';

describe('SourceComponent', () => {

  let component: SourceComponent;
  const tag = 'source-component';

  beforeEach(() => {

    define(tag, SourceComponent);
    component = document.createElement(tag) as SourceComponent;

  });

  it('should instantiate', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(SourceComponent);

  });

});
