import { AlertComponent } from '../lib/alerts/alert.component';
import { FormElementComponent } from '../lib/forms/form-element.component';
import { SidebarListItemComponent } from '../lib/sidebar/sidebar-list-item.component';
import { SidebarListComponent } from '../lib/sidebar/sidebar-list.component';
import { ContentHeaderComponent } from '../lib/header/content-header.component';
import { SidebarComponent } from '../lib/sidebar/sidebar.component';
import { SidebarItemComponent } from '../lib/sidebar/sidebar-item.component';
import { CardComponent } from '../lib/cards/card.component';
import { ListItemComponent } from '../lib/list-item/list-item.component';

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
customElements.define('nde-content-header', ContentHeaderComponent);
customElements.define('list-item', ListItemComponent);
