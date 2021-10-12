import { css, html, LitElement, property, unsafeCSS } from 'lit-element';
import { DGTLoggerService, Translator } from '@digita-ai/dgt-utils';
import { Checkbox, Theme } from '@digita-ai/dgt-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

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

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <label class="container">  
        <slot></slot>
        <input type="checkbox">
        <span class="check">${unsafeSVG(Checkbox)}</span>
    </label>
  `;

  }
  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
        .container {
            position: relative;
            padding-left: 35px;
            cursor: pointer;
            font-size: 22px;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        .container input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
        }
        
        .check {
            position: absolute;
            top: 0;
            left: 0;
            height: 23px;
            width: 23px;
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

        .container input:checked ~ .check svg {
            display: none;
        } 
  `,
    ];

  }

}

export default CheckboxComponent;
