import { css, html, LitElement, unsafeCSS, CSSResult, TemplateResult } from 'lit-element';
import { Theme } from '@digita-ai/dgt-theme';

export class SeparatorComponent extends LitElement {

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
      
      .separator {
        display: flex;
        align-items: center;
        text-align: center;
        color: var(--colors-foreground-light);
      }
      
      .separator::before,
      .separator::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--colors-foreground-light);
      }
      
      .separator:not(:empty)::before {
        margin-right: var(--gap-small);
      }
      
      .separator:not(:empty)::after {
        margin-left: var(--gap-small);
      }
      `,
    ];

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
    <div class="separator">
      <slot></slot>
    </div>
  `;

  }

}

export default SeparatorComponent;
