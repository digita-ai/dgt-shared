import { css, html, LitElement, unsafeCSS, CSSResult, TemplateResult } from 'lit-element';
import { Theme } from '@useid/dgt-theme';

/**
 * A list item component, consisting of an icon, text and an action.
 */
export class ListItemComponent extends LitElement {

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
      :host {
        display: flex;
        border: var(--border-normal) solid var(--colors-background-light);
        border-radius: var(--border-radius);
        background-color: var(--colors-foreground-inverse);
        padding: var(--gap-normal) var(--gap-normal);
        flex-direction:row;
        align-items: stretch;
      }

      :host > * {
        margin-right: var(--gap-normal);
      }

      :host > *:last-child {
        margin-right: 0px;
      }

      :host .text {
        flex: 1 1 auto
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
    <div class="icon">
      <slot name="icon"></slot>
    </div>
    <div class="text">
      <slot name="text"></slot>
    </div>
    <div class="action">
      <slot name="action"></slot>
    </div>
  `;

  }

}

export default ListItemComponent;
