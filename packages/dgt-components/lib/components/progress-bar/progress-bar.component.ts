import { css, CSSResult, html, LitElement, property, PropertyValues, TemplateResult } from 'lit-element';

/**
 * A component which represents a progress bar.
 * Steps can be selected by adding class 'selected' to their slots
 */
export class ProgressBarComponent extends LitElement {

  @property()
  private doUpdate?: string;

  constructor() {

    super();

  }

  updated(changed: PropertyValues): void {

    super.updated(changed);

    if (changed.has('doUpdate') && this.doUpdate) {

      // render circles above every step
      const slotted = this.shadowRoot?.querySelector('slot')?.assignedElements();

      slotted?.forEach((element) => {

        [ ... element.children ].forEach((child) => {

          element.removeChild(child);

        });

        const dot = document.createElement('span');

        dot.className = 'dot';
        dot.style.height = '20px';
        dot.style.width = '20px';
        dot.style.background = element.classList.contains('selected') ? 'var(--colors-foreground-normal)' : 'var(--colors-background-normal)';
        dot.style.border = '2px solid var(--colors-foreground-normal)';
        dot.style.zIndex = '10';
        dot.style.borderRadius = '50%';
        dot.style.display = 'inline-block';

        element.appendChild(dot);

      });

    }

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
    <div class="progress-container">
      <div class="dashes"></div>
      <div class="steps">
        <slot></slot>
      </div>
    </div>
    `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      css`
      .progress-container {
        position: relative;
      }
      .dashes {
        width: calc(100% - 20px - 20px);
        position: absolute;
        top: 12px;
        border-bottom: 1px dashed var(--colors-foreground-normal);
        margin-left: 20px;
      }
      .steps {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
      ::slotted(*) {
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        max-width: 20px;
      }
      `,
    ];

  }

}
