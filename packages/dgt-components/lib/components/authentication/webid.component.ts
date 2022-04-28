/* eslint-disable @typescript-eslint/ban-types */
import { html, unsafeCSS, css, TemplateResult, CSSResultArray, property } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';
import { debounce } from 'debounce';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Translator } from '@digita-ai/dgt-utils';
import { getLoggerFor, Logger } from '@digita-ai/handlersjs-logging';
import { define } from '../../util/define';
import { AlertComponent } from '../alerts/alert.component';

export class WebIdComponent extends RxLitElement {

  @property({ type: String }) textLabel = 'WebID';
  @property({ type: String }) textPlaceholder = 'Please enter your WebID ...';
  @property({ type: String }) textNoWebId = 'No WebID yet?';
  @property({ type: String }) textButton = 'Connect';
  @property({ type: String }) layout: 'horizontal' | 'vertical'  = 'horizontal';
  @property({ type: Array }) validationResults: string[];
  @property({ type: Boolean }) hideCreateNewWebId = false;
  @property({ type: Boolean }) disableLogin = true; // disable button by default
  @property({ type: Translator }) translator?: Translator;

  private logger: Logger = getLoggerFor(this, 5, 5);

  constructor() {

    super();

    define('alert-component', AlertComponent);

  }

  onSubmit = (event: Event & { target: HTMLFormElement }): void => {

    event.preventDefault();

    this.logger.info('onSubmit', event.target);

    this.dispatchEvent(new CustomEvent('submit-webid', {
      detail: event.target.querySelector<HTMLInputElement>('input[name=webid]').value,
    }));

  };

  onWebIdChange = debounce((target: HTMLInputElement): void => {

    this.logger.info('onWebIdChange', target);

    this.dispatchEvent(new CustomEvent('change-webid', {
      detail: target.value,
    }));

  }, 300);

  onButtonCreateWebIDClick = (): void => {

    this.logger.info('onButtonCreateWebIDClick');
    this.dispatchEvent(new CustomEvent('create-webid'));

  };

  render(): TemplateResult {

    const alerts = this.validationResults?.length > 0
      ? html`
        <alert-component
          hideDismiss
          hideIcon
          exportparts="alert"
          .translator="${this.translator}"
          .alert="${{ message: this.validationResults[0], type: 'warning' }}">
        </alert-component>`
      : '';

    return html`
    <slot name="before"></slot>
    <form @submit="${this.onSubmit}" part="webid-form">

      <label part="webid-label" for="webid">${this.textLabel}</label>
      <div class="webid-input-container" part="webid-input-container">

        <div class="webid-input-button-container ${ this.layout }" part="webid-input-button-container">
          <div class="webid-input-container" part="webid-input-container">
            <input part="webid-input" type="text" id="webid" name="webid" placeholder="${this.textPlaceholder}" @input="${(event: InputEvent) => { this.onWebIdChange(event.target as HTMLInputElement); }}"/>
            ${ this.layout === 'vertical' ? alerts : ''}
          </div>  
          <button
            part="webid-button"
            class="primary"
            disabled
            ?disabled="${this.disableLogin}">
              ${this.textButton.includes('<svg') ? unsafeSVG(this.textButton) : this.textButton}
          </button>
        </div>


        ${ this.layout === 'horizontal' ? alerts : ''}

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
        .webid-input-button-container.vertical {
          flex-direction: column;
          gap: var(--gap-normal);
        }
        .webid-input-button-container.vertical > button {
          width: 100%;
        }
        .webid-input-button-container .webid-input-container {
          flex: 1 1;
        }
        .webid-input-button-container button {
          width: 75px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .webid-input-button-container button:hover:enabled {
          background-color: var(--colors-primary-light);
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
