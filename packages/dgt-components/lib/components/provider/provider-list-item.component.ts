import { html, internalProperty, property, unsafeCSS, css, CSSResult, TemplateResult } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';

export class ProviderListItemComponent extends RxLitElement {

  @property({ type: String })
  public icon: string;
  @property({ type: String })
  public description: string;

  @internalProperty()
  buttonEnabled = true;
  onButtonClick = (): void => {

    this.buttonEnabled = false;
    this.dispatchEvent(new Event('button-clicked'));

  };
  render(): TemplateResult {

    return html`
    <div class="card-container" @click="${this.onButtonClick}">
      <div class="logo">
        <img src="${this.icon}">
      </div>
      <h1>${ this.description }</h1>
    </div>
 `;

  }
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
      .card-container {
        display: flex;
        align-items: center;
        background: var(--colors-background-light);
        box-shadow: 0px 2px 4px rgba(26, 32, 44, 0.1);
        border-radius: var(--border-large);
        margin: var(--gap-small) var(--gap-normal);
        padding: var(--gap-small);
        height: var(--gap-large);
        cursor: pointer;
      }

      h1 { 
        font-weight: bold;
        font-style: normal;
        font-size: var(--font-size-small);
        width: 100%;
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
