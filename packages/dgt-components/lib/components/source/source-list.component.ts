import { css, CSSResultArray, html, internalProperty, LitElement, property, PropertyValues, TemplateResult, unsafeCSS } from 'lit-element';
import { Theme } from '@useid/dgt-theme';
import { Source } from '../../models/source.model';
import { SourceComponent } from './source.component';

export class SourceListComponent extends LitElement {

  @property({ type: Array })
  public sources: Source[];

  @internalProperty()
  public query = '';

  @internalProperty()
  public filteredSources: Source[];

  @internalProperty()
  public buttonsEnabled = true;

  @property() textSearchFieldPlaceholder = 'Type here to search...';
  @property() textNoSearchResults = 'No search results!';

  constructor() {

    super();

    customElements.define('source-item', SourceComponent);

  }

  updated(changed: PropertyValues): void {

    super.updated(changed);

    if (changed.has('sources') || changed.has('query')) {

      this.filteredSources = this.sources?.filter(
        (source) => source.description.toLowerCase().includes(this.query.trim().toLowerCase())
      );

    }

  }

  onQueryUpdate = (e: Event & { target: HTMLInputElement }): void => { this.query = e.target.value; };

  onSourceSelected = (e: CustomEvent & { detail: { source: Source } }): void => {

    this.buttonsEnabled = false;
    this.dispatchEvent(new CustomEvent('source-selected', { detail: e.detail }));

  };

  render(): TemplateResult {

    return html`
      <input type="text" placeholder="${this.textSearchFieldPlaceholder}" @input="${this.onQueryUpdate}" value="${this.query}" />
      <div class="sources">
        ${ this.filteredSources?.length ? this.filteredSources.map((source) => html`
          <source-item .source="${source}" @source-selected="${this.onSourceSelected}" ?buttonEnabled=${this.buttonsEnabled}></source-item>
        `) : html` <h2>${this.textNoSearchResults}</h2> `
}
      </div>
`;

  }

  static get styles(): CSSResultArray {

    return [
      unsafeCSS(Theme),
      css`
      .sources {
        width: calc(100% - ( 2 * var(--gap-small)));
        display: flex;
        flex-direction: column;
        gap: var(--gap-normal);
        align-items: center;
      }
      input {
        width: calc(100% - ( 2 * ( var(--border-normal) + var(--gap-normal))));
        padding: var(--gap-normal);
        margin: var(--gap-normal) 0;
      }
      source-item {
        width: 100%;
      }
      `,
    ];

  }

}

export default SourceListComponent;
