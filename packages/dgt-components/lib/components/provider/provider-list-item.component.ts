import { html, internalProperty, property, unsafeCSS, css, CSSResult, TemplateResult } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

export class ProviderListItemComponent extends RxLitElement {

  @property({ type: String }) icon: string;
  @property({ type: String }) description: string;

  @internalProperty() buttonEnabled = true;

  onclick = (): void => {

    this.buttonEnabled = false;
    this.dispatchEvent(new Event('button-clicked'));

  };
  render(): TemplateResult {

    return html`
      <div class="logo" part="provider-logo">
        ${this.icon.includes('<svg') ? unsafeSVG(this.icon) : html`<img src="${this.icon}"/>`}
      </div>
      <p part="provider-description">${ this.description }</p>
 `;

  }
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
      :host {
        display: flex;
        align-items: center;
        gap: var(--gap-normal);
        background: var(--colors-background-light);
        margin: var(--gap-small) 0;
        padding: var(--gap-small);
        height: var(--gap-large);
        cursor: pointer;
      }

      .logo {
        width: var(--gap-large);
        height: 100%;
        display: flex;
        justify-content: center;
      }

      .logo > img, .logo > svg {
        fill: inherit;
        object-fit: scale-down;
        flex: 1 1;
        max-width: 100%;
        height: 100%;
      }

      p {
        margin: 0;
      }
      `,
    ];

  }

}
