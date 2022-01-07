import { Parser, Store } from 'n3';
import { addListener, ComponentEventTypes, ComponentReadEvent, ComponentResponseEvent, ComponentWriteEvent } from '@digita-ai/semcom-sdk';
import {FormElementComponent} from '../lib/components/forms/form-element.component';
import {CardComponent} from '../lib/components/cards/card.component';
import { DemoAuthenticateComponent } from './demo-authenticate.component';
import { ListItemComponent } from '../lib/components/list-item/list-item.component';
import { DemoComponent } from './demo.component';



customElements.define('demo-auth', DemoAuthenticateComponent);
customElements.define('nde-form-element', FormElementComponent);
customElements.define('nde-card', CardComponent);
customElements.define('list-item', ListItemComponent);
customElements.define('demo-component', DemoComponent);

const parser = new Parser();

addListener(ComponentEventTypes.READ, 'quads', document, async (event: ComponentReadEvent<'quads'>) => {

  console.log('reading', event);

  if (!event || !event.detail || !event.detail.uri) {

    throw new Error('Argument event || !event.detail || !event.detail.uri should be set.');

  }

  return fetch(event.detail.uri).then((response) => response.text().then((profileText) => {
    const quads = parser.parse(profileText);
    const store = new Store(quads);
    const filteredQuads = store.getQuads(event.detail.uri.split('#')[1] ? '#' + event.detail.uri.split('#')[1] : undefined , undefined, undefined, undefined);

    return new ComponentResponseEvent({
      detail: { uri: event.detail.uri, cause: event, data: filteredQuads, success: true, type: 'quads' },
    });

  }));

});

addListener(ComponentEventTypes.WRITE, 'quads', document, async (event: ComponentWriteEvent<'quads'>) => {

  console.log('writing', event);

  if (!event || !event.detail || !event.detail.uri) {

    throw new Error('Argument event || !event.detail || !event.detail.uri should be set.');

  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(new ComponentResponseEvent({
      detail: { ...event.detail, cause: event, success: true },
    })), 2000);
  });

});
