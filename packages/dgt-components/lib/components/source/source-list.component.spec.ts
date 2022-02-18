import { define } from '../../util/define';
import { SourceListComponent } from './source-list.component';

describe('SourceListComponent', () => {

  let component: SourceListComponent;
  const tag = 'source-list-component';

  beforeEach(() => {

    define(tag, SourceListComponent);
    component = document.createElement(tag) as SourceListComponent;

  });

  it('should instantiate', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(SourceListComponent);

  });

});
