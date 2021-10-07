import { css, html, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';
import { SolidSDKService } from '../lib/services/solid-sdk.service'
import { AuthenticateComponent } from '../lib/components/authentication/authenticate.component';

export class DemoAuthenticateComponent extends RxLitElement {
  private solidService = new SolidSDKService('UI Transfer');

  onAuthenticated = (event: CustomEvent): void => {  };


  constructor() {
    super();
    this.define('auth-flow', AuthenticateComponent);

  }

  define(tag: string, module: CustomElementConstructor): void {

    if (!customElements.get(tag)) customElements.define(tag, module);
  
  }
  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
        <auth-flow .solidService="${this.solidService}" @authenticated="${this.onAuthenticated}"></auth-flow>
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css``,
    ];

  }

}
