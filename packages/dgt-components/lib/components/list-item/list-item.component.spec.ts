import { ListItemComponent } from './list-item.component';

describe('ListItemComponent', () => {

  let component: ListItemComponent;
  const tag = 'list-item';

  beforeEach(() => {

    component = window.document.createElement(tag) as ListItemComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should display icon, text and action', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    const listItem = window.document.body.getElementsByTagName(tag)[0].shadowRoot;

    expect(listItem.querySelector('.icon')).toBeTruthy();
    expect(listItem.querySelector('.text')).toBeTruthy();
    expect(listItem.querySelector('.action')).toBeTruthy();

  });

});
