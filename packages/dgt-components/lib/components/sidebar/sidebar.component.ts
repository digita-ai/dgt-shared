import { css, html, property, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';
import { Translator } from '@digita-ai/dgt-utils';

/**
 * A component which represents a sidebar.
 */
export class SidebarComponent extends RxLitElement {

  /**
   * The component's translator.
   */
  @property({ type: Translator })
  public translator: Translator;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <div class="sidebar primary">
      <slot></slot>
    </div>
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          width: var(--size-sidebar);
        }
        .sidebar {
          flex: 1 0;
        }
        .sidebar.primary slot {
          height: 100%;
          max-height: inherit;
          display: flex;
          flex-direction: column;
          gap: var(--gap-normal);
          background-color: var(--colors-primary-dark);
          color: var(--colors-foreground-inverse);
        }
      `,
    ];

  }

}
