import { css, CSSResult, html, LitElement, property, TemplateResult, unsafeCSS } from 'lit-element';
import { DGTLoggerService, Translator } from '@digita-ai/dgt-utils';
import { Checkbox, Theme } from '@digita-ai/dgt-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { ifDefined } from 'lit-html/directives/if-defined';

/**
 * A component which shows the details of a single alert.
 */
export class CheckboxComponent extends LitElement {

  /**
   * The component's logger.
   */
  @property({ type: DGTLoggerService })
  public logger: DGTLoggerService;

  /**
   * The component's translator.
   */
  @property({ type: Translator })
  public translator: Translator;

  @property({ type: Boolean })
  public checked = false;

  @property({ type: String })
  public value: string;

  private toggle = (event: Event): void => {

    this.toggleAttribute('checked');
    this.dispatchEvent(new Event('change', { ...event }));

  };

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
    <label class="container">  
        <input @change="${this.toggle}" type="checkbox" ?checked="${this.checked}" value="${ifDefined(this.value)}">
        <span class="check">${unsafeSVG(Checkbox)}</span>
        <slot></slot>
    </label>
  `;

  }
  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        .container {
            position: relative;
            cursor: pointer;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            display: flex;
            align-items: center;
            gap: var(--gap-normal);
        }
        
        .container input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
        }
        
        .check {
            height: 23px;
            width: 23px;
            min-height: 23px;
            min-width: 23px;
            background-color: #eee;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .check svg {
            height: 100%;
            width:  100%;
            fill: #8fbe00;
            margin: 4.6px;
        }
        
        .container:hover input ~ .check {
            background-color: #ccc;
        }

        .container input ~ .check svg {
            display: none;
        } 

        .container input:checked ~ .check svg {
            display: block
        } 
  `,
    ];

  }

}

export default CheckboxComponent;
