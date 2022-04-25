import { css, CSSResultArray, html, LitElement, property, TemplateResult, unsafeCSS } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Theme, Location } from '@digita-ai/dgt-theme';
import { getLoggerFor } from '@digita-ai/handlersjs-logging';
import { predicateTranslations } from '../../models/predicate-translations';
import { Purpose } from '../../models/purpose.model';

export class ConsentResultComponent extends LitElement {

  private logger = getLoggerFor(this, 5, 5);

  @property({ type: String })
  public title: string;

  @property({ type: String })
  public bodyText: string;

  @property({ type: String })
  public buttonText: string;

  @property({ type: Object })
  public purpose: Purpose;

  onButtonClick = (): boolean => {

    this.logger.info('onButtonClick');

    return this.dispatchEvent(new CustomEvent('button-clicked'));

  };

  render(): TemplateResult {

    const hiddenPredicates = [
      'https://schema.org/uri',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      'http://www.w3.org/2006/vcard/ns#value',
    ];

    const predicatesToShow = this.purpose.predicates.filter((pred) => !hiddenPredicates.includes(pred));
    const translatedPredicates = predicatesToShow.map((pred) => predicateTranslations[pred] ?? pred);
    const uniqueTranslatedPredicates = Array.from(new Set(translatedPredicates));

    return html`
      <div class="result-container">
        <h1>${this.title}</h1>
        <p>${this.bodyText}</p>
        ${ uniqueTranslatedPredicates.map((predicate) => html`
          <div class="grey-block">
              <span>${ unsafeSVG(Location) }</span>
              <span class="predicate">${ predicate }</span>
          </div>
        `)}
        </div>
        <button @click="${this.onButtonClick}">
          ${this.buttonText}
        </button>
    `;

  }

  static get styles(): CSSResultArray {

    return [
      unsafeCSS(Theme),
      css`
      .result-container {
        box-shadow: 0px 2px 4px rgba(26, 32, 44, 0.1);       
        background-color: white;
        width: 100%;
        align-items: center;
        background-color: var(--colors-background-light);
        border-radius: 5px;
        padding-bottom: var(--gap-normal);
        padding-top: var(--gap-normal);
        margin-bottom: var(--gap-normal);
      }
      .grey-block {
        background-color: var(--colors-background-normal);
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: var(--gap-normal);
      }

      .grey-block svg {
        margin: var(--gap-small);
        width: var(--font-size-normal);
        height: var(--font-size-normal);
      }

      .predicate {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      button {
        width: 100%;
        border-radius: 5px;
        margin-top: var(--gap-large);
      }
  
      h1, p {
        margin: var(--gap-large) var(--gap-normal);
      }
      h1 {
        font-size: var(--font-size-header-normal);
      }
      p {
        font-size: var(--font-size-small);
      }
      `,
    ];

  }

}

export default ConsentResultComponent;
