import { ContentHeaderComponent } from './content-header.component';

describe('ContentHeaderComponent', () => {

  let component: ContentHeaderComponent;

  beforeEach(() => {

    component = window.document.createElement('card-header') as ContentHeaderComponent;

    const title = window.document.createElement('div');
    title.innerHTML = 'Foo';
    title.slot = 'title';
    component.appendChild(title);

    const subtitle = window.document.createElement('div');
    subtitle.innerHTML = 'Bar';
    subtitle.slot = 'subtitle';
    component.appendChild(subtitle);

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should show title and subtitle', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    const titleSlot = window.document.body.getElementsByTagName('card-header')[0].shadowRoot.querySelector<HTMLSlotElement>('slot[name="title"]');

    expect(titleSlot.assignedElements()[0].innerHTML).toBe('Foo');

    const subtitleSlot = window.document.body.getElementsByTagName('card-header')[0].shadowRoot.querySelector<HTMLSlotElement>('slot[name="subtitle"]');

    expect(subtitleSlot.assignedElements()[0].innerHTML).toBe('Bar');

  });

});
