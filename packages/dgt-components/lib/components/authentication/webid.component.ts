import { html, unsafeCSS, css, TemplateResult, CSSResultArray, property } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';
import { SolidSDKService } from '../../services/solid-sdk.service';

export class WebIdComponent extends RxLitElement {

  @property() textEnterYourWebID = 'Enter your WebID';
  @property() textWebID = 'WebID';
  @property() textWebIDFieldPlaceholder = 'Please enter your WebID ...';
  @property() textNoWebIDYet = 'No WebID yet?';
  @property() textConnect = 'Connect';
  @property({ type: Object }) solidService: SolidSDKService;

  constructor() {

    super();

  }

  onSubmit = (event: Event & { target: HTMLFormElement }): void => {

    event.preventDefault();
    this.dispatchEvent(new CustomEvent('submit-webid', { detail: event.target.querySelector<HTMLInputElement>('input[name=webid]').value }));

  };

  onButtonCreateWebIDClick = (): void => { this.dispatchEvent(new CustomEvent('create-webid')); };

  render(): TemplateResult {

    return html`
    <h1>${this.textEnterYourWebID}</h1>
    <form @submit="${this.onSubmit}">
        <label for="webid">${this.textWebID}</label>
        <input type="text" id="webid" name="webid" placeholder="${this.textWebIDFieldPlaceholder}" />
        <span @click="${this.onButtonCreateWebIDClick}">${this.textNoWebIDYet}</span>
        <button class="dark">${this.textConnect}</button>
    </form>
    `;

  }

  static get styles(): CSSResultArray {

    return [
      unsafeCSS(Theme),
      css`
        button {
          width: 100%;
          margin: var(--gap-large) 0;
          border-radius: var(--border-large);
        }

        input  {
          margin: var(--gap-small) 0;
          padding: var(--gap-normal);
        }

        span {
          font-size: var(--font-size-small);
          padding: var(--gap-tiny);
          text-decoration: underline;
          color: var(--colors-primary-normal);
          text-align: right;
        }

        span:hover {
          color: var(--colors-primary-dark);
        }

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

export default WebIdComponent;
