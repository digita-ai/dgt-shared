import { css, CSSResultArray, html, internalProperty, LitElement, property, TemplateResult, unsafeCSS } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Location, Edit, Theme } from '@useid/dgt-theme';
import { Purpose } from '../../models/purpose.model';
import { predicateTranslations } from '../../models/predicate-translations';

export class ConsentRequestComponent extends LitElement {

  @property({ type: Object })
  public purpose: Purpose;

  @internalProperty()
  public checked = false;

  @property() textYourData = 'Your data';
  @property() textYourConsent = 'Your consent';
  @property() textIAgree = 'I agree';
  @property() textContinue = 'Continue';

  onButtonClick = (): void => {

    this.dispatchEvent(new CustomEvent('consent-given'));

  };

  onConsentCheck = (): void => {

    this.checked = !this.checked;

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
      <div class="data-container">
        <h1>${this.textYourData}</h1>
        <p>${this.purpose.description}</p>
        ${ uniqueTranslatedPredicates.map((predicate) => html`
          <div class="grey-block">
            <span class="icon">${ unsafeSVG(Location) }</span>
            <span class="predicate">${ predicate }</span>
            <span class="edit">${ unsafeSVG(Edit) }</span>
          </div>
        `)}
      </div>

      <div class="consent-container">
        <h1>${this.textYourConsent}</h1>
        <div class="consent-box">
          <input type="checkbox" ?checked="${this.checked}" @change="${this.onConsentCheck}"/>
          <label>${this.textIAgree}</label>
        </div>
      </div>

      <button ?disabled="${!this.checked}" @click="${this.onButtonClick}">
        <div>${this.textContinue}</div>
      </button>
    `;

  }

  static get styles(): CSSResultArray {

    return [
      unsafeCSS(Theme),
      css`
        .data-container, .consent-container {
          width: 100%;
          box-shadow: 0px 2px 4px rgba(26, 32, 44, 0.1);       
          background-color: white;
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

        .predicate {
          flex: 1 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .edit{
          cursor: pointer;
        }
  
        .grey-block svg {
          margin: var(--gap-small);
          width: var(--font-size-normal);
          height: var(--font-size-normal);
        }

        .consent-box {
          display: flex;
          align-items: center;
        }

        .consent-box  label {
          margin-left: var(--gap-small)
        }
  
        button {
          border-radius: 5px;
          width: 100%;
          margin-top: var(--gap-large);
          display: flex;
          align-items: center;
        }

        button div {
          text-align: center;
          width: 100%;
        }

        .consent-box label {
          justify-content: center;
          text-align: center;
        }

        .consent-box input {
          display: block;
        }
  
        h1, p, .consent-box {
          margin: var(--gap-large) var(--gap-normal);
        }
        h1 {
          font-size: var(--font-size-header-normal);
        }
        p {
          font-size: var(--font-size-small);
        }`,
    ];

  }

}

export default ConsentRequestComponent;
