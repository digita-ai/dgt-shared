import fetchMock from 'jest-fetch-mock';
import { AlertComponent } from '../lib/components/alerts/alert.component';
import { FormElementComponent } from '../lib/components/forms/form-element.component';
import { SidebarListItemComponent } from '../lib/components/sidebar/sidebar-list-item.component';
import { SidebarListComponent } from '../lib/components/sidebar/sidebar-list.component';
import { ContentHeaderComponent } from '../lib/components/header/content-header.component';
import { SidebarComponent } from '../lib/components/sidebar/sidebar.component';
import { SidebarItemComponent } from '../lib/components/sidebar/sidebar-item.component';
import { CardComponent } from '../lib/components/cards/card.component';
import { ListItemComponent } from '../lib/components/list-item/list-item.component';

/**
 * Register tags for components.
 */
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-form-element', FormElementComponent);
customElements.define('nde-sidebar-item', SidebarItemComponent);
customElements.define('nde-sidebar-list-item', SidebarListItemComponent);
customElements.define('nde-sidebar-list', SidebarListComponent);
customElements.define('nde-sidebar', SidebarComponent);
customElements.define('nde-large-card', CardComponent);
customElements.define('card-header', ContentHeaderComponent);
customElements.define('list-item', ListItemComponent);

/**
 * Enable mocks for fetch.
 */
fetchMock.enableMocks();
