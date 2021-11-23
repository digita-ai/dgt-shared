import { Parser, Store } from 'n3';
import { ComponentEventType, ComponentReadEvent, ComponentResponseEvent, ComponentWriteEvent } from '@digita-ai/semcom-sdk';
import {ProfileNameComponent} from '../lib/components/profile/profile-name.component';
import {FormElementComponent} from '../lib/components/forms/form-element.component';
import {CardComponent} from '../lib/components/cards/card.component';
import { ProfileContactComponent } from '../lib/components/profile/profile-contact.component';
import { ProfilePayslipComponent } from '../lib/components/profile/profile-payslip.component';
import { DemoAuthenticateComponent } from './demo-authenticate.component';
import { ListItemComponent } from '../lib/components/list-item/list-item.component';
import { DemoComponent } from './demo.component';
import { BarcodeComponent } from '../lib/components/barcode/barcode.component'



customElements.define('demo-auth', DemoAuthenticateComponent);
customElements.define('nde-form-element', FormElementComponent);
customElements.define('nde-card', CardComponent);
customElements.define('profile-name-component', ProfileNameComponent);
customElements.define('profile-contact-component', ProfileContactComponent);
customElements.define('profile-payslip-component',  ProfilePayslipComponent);
customElements.define('list-item', ListItemComponent);
customElements.define('demo-component', DemoComponent);
customElements.define('barcode-component', BarcodeComponent);

const parser = new Parser();

document.addEventListener(ComponentEventType.READ, (event: ComponentReadEvent) => {

  console.log('reading', event);

  if (!event || !event.detail || !event.detail.uri) {

    throw new Error('Argument event || !event.detail || !event.detail.uri should be set.');

  }

  fetch(event.detail.uri).then((response) => response.text().then((profileText) => {
    const quads = parser.parse(profileText);
    const store = new Store(quads);
    const filteredQuads = store.getQuads(event.detail.uri.split('#')[1] ? '#' + event.detail.uri.split('#')[1] : undefined , undefined, undefined, undefined);

    event.target?.dispatchEvent(new ComponentResponseEvent({
      detail: { uri: event.detail.uri, cause: event, data: filteredQuads, success: true },
    }));

  }));

});

document.addEventListener(ComponentEventType.WRITE, (event: ComponentWriteEvent) => {

  console.log('writing', event);

  if (!event || !event.detail || !event.detail.uri) {

    throw new Error('Argument event || !event.detail || !event.detail.uri should be set.');

  }

  setTimeout(() => event.target?.dispatchEvent(new ComponentResponseEvent({
    detail: { ...event.detail, cause: event, success: true },
  })), 2000);

});
