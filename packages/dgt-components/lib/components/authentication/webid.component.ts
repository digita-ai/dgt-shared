import { html, unsafeCSS, css, TemplateResult, CSSResultArray, property } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';

export class WebIdComponent extends RxLitElement {

  @property({ type: String }) textLabel = 'WebID';
  @property({ type: String }) textPlaceholder = 'Please enter your WebID ...';
  @property({ type: String }) textNoWebId = 'No WebID yet?';
  @property({ type: String }) textButton = 'Connect';

  @property({ type: Boolean }) hideCreateNewWebId = false;

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
    <slot name="before"></slot>
    <form @submit="${this.onSubmit}">
        <label for="webid">${this.textLabel}</label>
        <input type="text" id="webid" name="webid" placeholder="${this.textPlaceholder}" />
        <a ?hidden="${this.hideCreateNewWebId}" @click="${this.onButtonCreateWebIDClick}">${this.textNoWebId}</a>
        <button class="dark">${this.textButton}</button>
    </form>
    <slot name="after"></slot>
    `;

  }

  static get styles(): CSSResultArray {

    return [
      unsafeCSS(Theme),
      css`
        button {
          width: 100%;
          margin: var(--gap-normal) 0 0 0;
          border-radius: var(--border-large);
          height: var(--button-height);
        }

        input  {
          margin: var(--gap-small) 0;
          padding: var(--input-padding);
        }

        a {
          font-size: var(--font-size-small);
          padding: var(--gap-tiny);
          text-decoration: underline;
          color: var(--colors-primary-normal);
          text-align: right;
          cursor: pointer;
        }

        a:hover {
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
