import { css, html, unsafeCSS, CSSResult, TemplateResult } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';

/**
 * A component which represents a sidebar list item.
 */
export class SidebarListComponent extends RxLitElement {

  /**
   * Selects clicked list item and deselected all other list items.
   *
   */
  select(event: MouseEvent){

    const element = event.composedPath().find((el: Element) => el.localName === 'nde-sidebar-list-item') as Element;

    if(element && !element.hasAttribute('isTitle')){

      for(let i = 0; i < this.children.length; i++) {

        this.children.item(i).removeAttribute('selected');

      }

      element.setAttribute('selected', '');

    }

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
    <slot name="title" @click="${this.select}"></slot>
    <div class="list">
      <slot name="item" @click="${this.select}"></slot>
    </div>
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
      *::-webkit-scrollbar-thumb {
        background-color: var(--colors-foreground-light);
        border: 3px solid var(--colors-foreground-normal);
      }
      *::-webkit-scrollbar-track {
        background: var(--colors-foreground-normal);
      }
      :host {
        scrollbar-color: var(--colors-foreground-light) var(--colors-foreground-normal);
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        height: 100%;
      }
      .list {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        padding: var(--gap-normal) 0;
      }
      `,
    ];

  }

}
