import { define } from '../../util/define';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {

  let component: ProgressBarComponent;
  const tag = 'progress-bar-component';
  const progressElement1 = document.createElement('div');
  const progressElement2 = document.createElement('div');
  const progressElement3 = document.createElement('div');
  progressElement1.className = 'selected';
  progressElement1.slot = '';
  progressElement2.slot = '';
  progressElement3.slot = '';

  beforeEach(() => {

    define(tag, ProgressBarComponent);
    component = document.createElement(tag) as ProgressBarComponent;
    component.appendChild(progressElement1);
    component.appendChild(progressElement2);
    component.appendChild(progressElement3);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    component['doUpdate'] = 'true';

  });

  it('should instantiate', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(ProgressBarComponent);

  });

  it('should be able to change selected', async () => {

    // eslint-disable-next-line @typescript-eslint/dot-notation
    component['doUpdate'] = 'true';
    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component.children[0].className).toContain('selected');
    expect(component.children[1].className).not.toContain('selected');
    expect(component.children[2].className).not.toContain('selected');

    progressElement1.className = '';
    progressElement2.className = 'selected';

    // eslint-disable-next-line @typescript-eslint/dot-notation
    component['doUpdate'] = 'true';
    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component.children[0].className).not.toContain('selected');
    expect(component.children[1].className).toContain('selected');
    expect(component.children[2].className).not.toContain('selected');

  });

});
