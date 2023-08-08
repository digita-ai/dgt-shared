import { Parser } from 'n3';
import { CardComponent } from '../lib/components/cards/card.component';
import { DemoAuthenticateComponent } from './demo-authenticate.component';
import { ListItemComponent } from '../lib/components/list-item/list-item.component';
import { DemoComponent } from './demo.component';
import { ProgressBarComponent } from '../lib/components/progress-bar/progress-bar.component';
import { hydrate } from '../lib/util/hydrate';
import { define } from '../lib/util/define';
import { ContentHeaderComponent } from '../lib/components/header/content-header.component';


define('demo-auth', DemoAuthenticateComponent);
define('card-component', CardComponent);
define('list-item', ListItemComponent);
define('demo-component', DemoComponent);
define('progress-bar', ProgressBarComponent);
define('content-header-component', hydrate(ContentHeaderComponent)());

const parser = new Parser();

// addListener(ComponentEventTypes.READ, 'quads', document, async (event: ComponentReadEvent<'quads'>) => {

//   console.log('reading', event);

//   if (!event || !event.detail || !event.detail.uri) {

//     throw new Error('Argument event || !event.detail || !event.detail.uri should be set.');

//   }

//   return fetch(event.detail.uri).then((response) => response.text().then((profileText) => {
//     const quads = parser.parse(profileText);
//     const store = new Store(quads);
//     const filteredQuads = store.getQuads(event.detail.uri.split('#')[1] ? '#' + event.detail.uri.split('#')[1] : undefined , undefined, undefined, undefined);

//     return new ComponentResponseEvent({
//       detail: { uri: event.detail.uri, cause: event, data: filteredQuads, success: true, type: 'quads' },
//     });

//   }));

// });

// addListener(ComponentEventTypes.WRITE, 'quads', document, async (event: ComponentWriteEvent<'quads'>) => {

//   console.log('writing', event);

//   if (!event || !event.detail || !event.detail.uri) {

//     throw new Error('Argument event || !event.detail || !event.detail.uri should be set.');

//   }

//   return new Promise((resolve) => {
//     setTimeout(() => resolve(new ComponentResponseEvent({
//       detail: { ...event.detail, cause: event, success: true },
//     })), 2000);
//   });

// });
