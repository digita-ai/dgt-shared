import { Theme } from '@digita-ai/dgt-theme';
import { css, html, LitElement, property, unsafeCSS } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { ContentHeaderComponent } from '../header/content-header.component';

/**
 * A large card component
 */
export class CardComponent extends LitElement {

  /** Determine whether the header of the card should be shown */
  @property({ type: Boolean })
  public hideHeader = false;

  /** Determine whether the image of the card should be shown */
  @property({ type: Boolean })
  public hideImage = false;

  /** Determine whether the content of the card should be shown */
  @property({ type: Boolean })
  public hideContent = false;

  constructor() {

    super();
    this.define('card-header', ContentHeaderComponent);

  }

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
        .large-card {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .content {
          background-color: var(--colors-foreground-inverse);
          padding: var(--gap-large);
        }
        .image {
          flex: 0 0 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--colors-foreground-inverse);
        }
        .image slot[name="image"]::slotted(*) {
          height: 200px;
          width: 100%;
          object-fit: cover;
        }
        .reduced-top-padding {
          padding-top: var(--gap-normal);
        }
      `,
    ];

  }

  render() {

    const classes = { 'reduced-top-padding': this.hideImage };

    return html`
      <div class="large-card">

        ${!this.hideHeader
    ? html`
            <card-header class="inverse">
              <slot name="icon" slot="icon"></slot>
              <slot name="title" slot="title"></slot>
              <slot name="subtitle" slot="subtitle"></slot>
              <slot name="actions" slot="actions"></slot>
            </card-header>
          `
    : html``
}
        ${!this.hideImage
    ? html`
          <div class="image">
            <slot name="image"></slot>
          </div>
        `
    : html``
}

        ${!this.hideContent
    ? html`
          <div class="content ${classMap(classes)}">
            <slot name="content"></slot>
          </div>
        `
    : html``
}

      </div>
    `;

  }

  define(tag: string, module: CustomElementConstructor): void {

    if (!customElements.get(tag)) {

      customElements.define(tag, module);

    }

  }

}

export default CardComponent;
