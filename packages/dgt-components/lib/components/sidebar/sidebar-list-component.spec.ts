import { SidebarListComponent } from './sidebar-list.component';

describe('SidebarListComponent', () => {

  let component = new SidebarListComponent();

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  beforeEach(() => {

    component = window.document.createElement('sidebar-list') as SidebarListComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should call select when select is clicked', async () => {

    const event = document.createEvent('MouseEvent');
    const el = document.createElement('sidebar-list-item');

    expect(el.hasAttribute('selected')).toBeFalsy();

    const selectSpy = jest.spyOn(component, 'select');

    window.document.body.appendChild(component);
    await component.updateComplete;

    event.composedPath = jest.fn(() => [ el ]);
    component.select(event);

    expect(selectSpy).toHaveBeenCalledTimes(1);
    expect(el.hasAttribute('selected')).toBeTruthy();

  });

  it('should call select when select is clicked', async () => {

    const selectSpy = jest.spyOn(component, 'select');

    window.document.body.appendChild(component);
    await component.updateComplete;

    const select = window.document.body.getElementsByTagName('sidebar-list')[0].shadowRoot.querySelector('slot[name="item"]') as HTMLElement;
    select.click();

    expect(selectSpy).toHaveBeenCalledTimes(1);

  });

});
