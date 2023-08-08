import { SidebarListItemComponent } from './sidebar-list-item.component';

describe('SidebarListItemComponent', () => {

  let component = new SidebarListItemComponent();

  beforeEach(() => {

    component = window.document.createElement('sidebar-list-item') as SidebarListItemComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should add select class when selected', async () => {

    component.selected = true;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('sidebar-list-item')[0].shadowRoot.querySelectorAll<HTMLLIElement>('.item.selected')).toHaveLength(1);

  });

});
