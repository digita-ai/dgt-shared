import { html, internalProperty, property, unsafeCSS, css, CSSResult, TemplateResult } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';

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
      <div class="logo">
        <img src="${this.icon}">
      </div>
      <p>${ this.description }</p>
 `;

  }
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
      :host {
        display: flex;
        align-items: center;
        background: var(--colors-background-light);
        margin: var(--gap-small) 0;
        padding: var(--gap-small);
        height: var(--gap-large);
        cursor: pointer;
      }

      img {
        background-color: transparent;
        margin-right: var(--gap-small);
        width: var(--gap-large);
      }
      `,
    ];

  }

}
