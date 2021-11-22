/* eslint-disable no-console -- is a web component */
import { Store } from 'n3';
import { css, CSSResult, html, internalProperty, property, PropertyValues, query, TemplateResult, unsafeCSS } from 'lit-element';
import { ComponentResponseEvent } from '@digita-ai/semcom-sdk';
import { Theme } from '@digita-ai/dgt-theme';
import JsBarcode from 'jsbarcode';
import { BaseComponent } from '../base/base.component';

export class BarcodeComponent extends BaseComponent {

  @internalProperty() cardNumber?: string;
  @internalProperty() program?: string;
  @property({ type: Boolean }) hideProgram = false;

  @query('#barcode') barcodeSvg?: HTMLOrSVGElement;

  /**
   * Handles a response event.
   * Expects an event containing a detail object that contains a data object containing quads. Will take the first quad containing a membershipNumber it finds.
   * Make sure to filter the quads you send it if you want a specific barcode.
   *
   * @param event The response event to handle.
   */
  handleResponse(event: ComponentResponseEvent): void {

    console.log('handleResponse');

    if (!event || !event.detail || !event.detail.data) {

      throw new Error('Arguments event, event.detail, and event.detail.data should be set.');

    }

    const store = new Store(event.detail.data);

    const quad = store.getQuads(undefined, 'http://schema.org/membershipNumber', undefined, undefined)[0];

    const program = store.getQuads(quad.subject, 'http://schema.org/programName', undefined, undefined)[0];

    this.cardNumber = quad.object.value;
    this.program = program.object.value;

  }

  updated(changed: PropertyValues): void {

    if (changed.has('entry') && this.entry) this.readData(this.entry);

    if (this.barcodeSvg) {

      JsBarcode(this.barcodeSvg, this.cardNumber);

    }

    super.updated(changed);

  }

  render(): TemplateResult {

    return html`
      ${this.program && !this.hideProgram ? html`<p id="program">${this.program}</p>` : ''}
      <svg id="barcode"></svg>
    `;

  }

  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
      
        :host {
          display: flex;
          flex-direction: column;
        }

        :host > * {
          align-self: center;
        }

        #barcode {
          width: 200px;
          height: 110px;
        }

      `,
    ];

  }

}

export default BarcodeComponent;
