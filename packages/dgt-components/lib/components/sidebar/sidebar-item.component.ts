import { css, html, property, unsafeCSS, CSSResult, TemplateResult } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';

/**
 * A component which represents a sidebar item.
 */
export class SidebarItemComponent extends RxLitElement {

  /**
   * Indicate wether padding should be automatically applied
   */
  @property({ type: Boolean })
  public padding = true;

  /**
   * Indicate wether the bottom border should be shown
   */
  @property({ type: Boolean })
  public showBorder = true;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
    <div class="content-container ${this.showBorder ? ' border': ''}${this.padding ? ' padding' : ''}">
      <slot name="content"></slot>
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
        div.content-container {
          height: 100%;
        }
        .border {
          border-bottom: 1px solid var(--colors-primary-normal);
        }
        .padding {
          padding: var(--gap-normal) var(--gap-large);
        }
      `,
    ];

  }

}
