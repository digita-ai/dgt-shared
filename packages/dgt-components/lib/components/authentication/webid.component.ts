import { html, unsafeCSS, css, TemplateResult, CSSResultArray, property } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';
import { define } from '../../util/define';
import { AlertComponent } from '../alerts/alert.component';
import { Translator } from '../../services/i18n/translator';
export class WebIdComponent extends RxLitElement {

  @property({ type: String }) textLabel = 'WebID';
  @property({ type: String }) textPlaceholder = 'Please enter your WebID ...';
  @property({ type: String }) textNoWebId = 'No WebID yet?';
  @property({ type: String }) textButton = 'Connect';
  @property({ type: Array }) validationResults: string[] = [];
  @property({ type: Boolean }) hideCreateNewWebId = false;
  @property({ type: Translator }) translator?: Translator;

  constructor() {

    super();

    define('alert-component', AlertComponent);

  }

  onSubmit = (event: Event & { target: HTMLFormElement }): void => {

    event.preventDefault();

    this.dispatchEvent(new CustomEvent('submit-webid', {
      detail: event.target.querySelector<HTMLInputElement>('input[name=webid]').value,
    }));

  };

  onWebIdChange = (event: Event & { target: HTMLInputElement }): void => {

    event.preventDefault();

    this.dispatchEvent(new CustomEvent('change-webid', {
      detail: event.target.value,
    }));

  };

  onButtonCreateWebIDClick = (): void => { this.dispatchEvent(new CustomEvent('create-webid')); };

  onAlertDismissed = (event: CustomEvent): void => {

    this.dispatchEvent(new CustomEvent(event.type, { detail: event.detail }));

  };

  render(): TemplateResult {

    return html`
    <slot name="before"></slot>
    <form @submit="${this.onSubmit}" part="webid-form">
      ${this.validationResults?.length > 0
    ? html`<alert-component
        @dismiss="${this.onAlertDismissed}"
        exportparts="validation-alert"
        .translator="${this.translator}"
        .alert="${{ message: this.validationResults[0], type: 'warning' }}">
      </alert-component>`
    : ''}
      <label part="webid-label" for="webid">${this.textLabel}</label>
      <input part="webid-input" type="text" id="webid" name="webid" placeholder="${this.textPlaceholder}" @input="${this.onWebIdChange}"/>
      <a part="webid-create" ?hidden="${this.hideCreateNewWebId}" @click="${this.onButtonCreateWebIDClick}">${this.textNoWebId}</a>
      <button part="webid-button" class="dark">${this.textButton}</button>
    </form>
    <slot name="after"></slot>
    `;

  }

  static get styles(): CSSResultArray {

    return [
      unsafeCSS(Theme),
      css`
        form {
          display: flex;
          flex-direction: column;
          gap: var(--gap-normal);
        }

        button {
          width: 100%;
          border-radius: var(--border-large);
          height: var(--button-height);
        }

        input  {
          padding: var(--gap-normal);
        }

        a {
          font-size: var(--font-size-small);
          padding: var(--gap-tiny);
          text-decoration: underline;
          color: var(--colors-primary-normal);
          align-self: flex-end;
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
