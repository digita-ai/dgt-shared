import { css, CSSResultArray, html, internalProperty, LitElement, property, TemplateResult, unsafeCSS } from 'lit-element';
import { Theme } from '@digita-ai/dgt-theme';
import { Issuer } from '../../models/issuer.model';
import { ProviderListItemComponent } from './provider-list-item.component';

export class ProviderListComponent extends LitElement {

  @property({ type: Array })
  public providers: Issuer[];

  @internalProperty()
  public buttonsEnabled = true;

  constructor() {

    super();

    if (!customElements.get('provider-list-item')) customElements.define('provider-list-item', ProviderListItemComponent);

  }

  onIssuerSelected = (issuer: Issuer) => (): void => {

    this.buttonsEnabled = false;
    this.dispatchEvent(new CustomEvent('issuer-selected', { detail: issuer }));

  };

  render(): TemplateResult {

    return html`
      <h1>Select an identity provider to log in</h1>
      <div class="providers">
      ${ this.providers.map((provider) => html`
        <provider-list-item @button-clicked="${this.onIssuerSelected(provider)}" .icon="${provider.icon}" .description="${provider.description}" ?buttonEnabled=${this.buttonsEnabled}></provider-list-item>
        `)}</div>`;

  }

  static get styles(): CSSResultArray {

    return [
      unsafeCSS(Theme),
      css`
      h1 {
        margin: var(--gap-large) var(--gap-normal);
        font-size: var(--font-size-header-normal);
        font-style: normal;
        font-weight: bold;
        text-align: center;
      }
      `,
    ];

  }

}

export default ProviderListComponent;
