import { css, CSSResult, html, LitElement, property, TemplateResult, unsafeCSS } from 'lit-element';
import { ArgumentError, DGTLoggerService, Translator } from '@digita-ai/dgt-utils';
import { Bell, Cross, Theme } from '@digita-ai/dgt-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Alert } from './alert';

/**
 * A component which shows the details of a single alert.
 */
export class AlertComponent extends LitElement {

  /**
   * The component's logger.
   */
  @property({ type: DGTLoggerService }) logger?: DGTLoggerService;
  /**
   * The component's translator.
   */
  @property({ type: Translator }) translator?: Translator;

  /**
   * The collection which will be rendered by the component.
   */
  @property({ type: Object })
  alert: Alert;

  /**
   * Whether the icon should be hidden.
   */
  @property({ type: Boolean })
  hideIcon = false;

  /**
   * Whether the dismiss icon should be hidden.
   */
  @property({ type: Boolean })
  hideDismiss = false;

  /**
   * Dispatches an event to dismiss the alert.
   */
  dismiss(): void {

    this.logger?.debug(AlertComponent.name, 'Dismissing alert', this.alert);

    if (!this.alert) {

      throw new ArgumentError('Argument this.alert should be set.', this.alert);

    }

    this.dispatchEvent(new CustomEvent<Alert>('dismiss', { detail: this.alert }));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const message = this.translator ? this.translator.translate(this.alert?.message) : this.alert?.message;
    const type = this.alert && this.alert.type ? this.alert.type : 'warning';

    return html`
    <div part="alert" class="alert ${ type }">
      <div class="icon" ?hidden="${this.hideIcon}">${ unsafeSVG(Bell) }</div>
      <div class="message">${ message }</div>
      <div class="dismiss" @click="${ this.dismiss }" ?hidden="${this.hideDismiss}">${ unsafeSVG(Cross) }</div>
    </div>
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          display: block;
        }
        
        .alert{
          padding: var(--gap-normal) var(--gap-small);
          display: flex;
          align-items: center;
        }
        .alert > div {
          margin: 0 var(--gap-small);
        }
        .success {
          background-color: var(--colors-status-success);
        }
        .warning {
          background-color: var(--colors-status-warning);
        }
        .danger {
          background-color: var(--colors-status-danger);
          color: var(--colors-foreground-inverse);
        }
        .danger svg {
          fill: var(--colors-foreground-inverse);
        }
        .icon {
          height: 25px;
        }
        .icon svg {
          max-height: 25px;
          max-width: 25px;
        }
        .dismiss {
          cursor: pointer;
          padding: 0px var(--gap-small);
        }
        .dismiss svg {
          max-height: var(--gap-small);
          max-width: var(--gap-small);
        }
        .message {
          flex: 1 0;
        }
      `,
    ];

  }

}

export default AlertComponent;
