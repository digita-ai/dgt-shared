import { css, html, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';
import { CheckboxComponent } from '../lib/components/checkbox/checkbox.component';

export class DemoComponent extends RxLitElement {

  constructor() {
    super();
    customElements.define('checkbox-component', CheckboxComponent);

  }

  private onCheckboxClicked = (e: Event) => {
    console.log((e.target as CheckboxComponent).checked)
    const checkboxes = [...this.shadowRoot.querySelectorAll<CheckboxComponent>('checkbox-component')];
    this.shadowRoot.querySelector<HTMLButtonElement>('form > button').disabled = !checkboxes.every(checkbox => checkbox.checked)
  }

  private onButtonClicked = (e: MouseEvent) => {
    e.preventDefault();
  }
  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <form>
      <checkbox-component @change="${this.onCheckboxClicked}">I agree</checkbox-component>
      <checkbox-component @change="${this.onCheckboxClicked}">I consent</checkbox-component>
      <checkbox-component @change="${this.onCheckboxClicked}">I would like to receive promotional e-mails</checkbox-component>
      <button disabled @click="${this.onButtonClicked}">Continue</button>
    </form>
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
      form {
        display: flex;
        flex-direction: column;
        gap: var(--gap-small);
        padding: var(--gap-small);
        background-color: white;
      }
      `,
    ];

  }

}
