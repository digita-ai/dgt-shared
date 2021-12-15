/* eslint-disable @typescript-eslint/ban-types */
import { html, unsafeCSS, css, TemplateResult, CSSResultArray, property } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';
import { debounce } from 'debounce';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
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

  onWebIdChange = debounce((target: HTMLInputElement): void => {

    this.dispatchEvent(new CustomEvent('change-webid', {
      detail: target.value,
    }));

  }, 300);

  onButtonCreateWebIDClick = (): void => { this.dispatchEvent(new CustomEvent('create-webid')); };

  render(): TemplateResult {

    return html`
    <slot name="before"></slot>
    <form @submit="${this.onSubmit}" part="webid-form">

      <label part="webid-label" for="webid">${this.textLabel}</label>
      <div class="webid-input-container" part="webid-input-container">

        <div class="webid-input-button-container">
          <input part="webid-input" type="text" id="webid" name="webid" placeholder="${this.textPlaceholder}" @input="${(event: InputEvent) => { this.onWebIdChange(event.target as HTMLInputElement); }}"/>
          <button
            part="webid-button"
            class="primary"
            disabled
            ?disabled="${this.validationResults && this.validationResults?.length > 0}">
        ${this.textButton.includes('<svg') ? unsafeSVG(this.textButton) : this.textButton}
          </button>
        </div>

        
        ${this.validationResults?.length > 0
    ? html`
        <alert-component
          hideDismiss
          hideIcon
          exportparts="alert"
          .translator="${this.translator}"
          .alert="${{ message: this.validationResults[0], type: 'warning' }}">
        </alert-component>`
    : ''}

      </div>
      <a part="webid-create" ?hidden="${this.hideCreateNewWebId}" @click="${this.onButtonCreateWebIDClick}">${this.textNoWebId}</a>

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
        .webid-input-container {
          display: flex;
          flex-direction: column;
        }
        ::part(alert) {
          padding: var(--gap-small);
        }
        .webid-input-button-container {
          display: flex;
        }
        .webid-input-button-container input {
          flex: 1 1;
        }
        .webid-input-button-container button {
          width: 75px;
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
