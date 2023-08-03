import { css, html, property, LitElement, unsafeCSS, TemplateResult, CSSResultArray } from 'lit-element';
import { Theme } from '@useid/dgt-theme';
import { Source } from '../../models/source.model';

/**
 * An Invite Source renders a source with which a user can connect.
 */
export class SourceComponent extends LitElement {

  @property({ type: Object })
  private source: Source;

  @property({ type: Boolean })
  private buttonEnabled: boolean;

  onSourceSelected = (): void => {

    this.dispatchEvent(new CustomEvent('source-selected', { detail: this.source }));

  };

  render(): TemplateResult {

    return html`
    <div class="source-container" @click="${this.onSourceSelected}">
      <img src="${this.source?.icon}">
      <span>${this.source?.description}</span>
    </div>
    `;

  }

  static get styles(): CSSResultArray {

    return [
      unsafeCSS(Theme),
      css`
      .source-container {
        box-shadow: 0px 2px 4px rgba(26, 32, 44, 0.1);       
        background-color: white;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        border-radius: var(--border-large);
        padding: var(--gap-small);
      }

      .source-container:hover {
        cursor: pointer;
      }

      img {
        margin: var(--gap-small);
        height: var(--font-size-header-normal);
        width: var(--font-size-header-normal);
        border-radius: 50%;
      }

      span {
        flex-grow: 1;
        font-size: var(--font-size-header-normal);
      }
      `,
    ];

  }

}

export default SourceComponent;
