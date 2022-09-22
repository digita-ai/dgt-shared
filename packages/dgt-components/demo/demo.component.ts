import { css, html, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';
import { CheckboxComponent } from '../lib/components/checkbox/checkbox.component';
import { createMachine, interpret, Interpreter, StateMachine } from 'xstate';
import { FormContext, FormStateSchema, FormState, formMachine } from '../lib/components/forms/form.machine';
import { FormEvent, FormUpdatedEvent } from '../lib/components/forms/form.events';
import { FormValidator } from '../lib/components/forms/form-validator';
import { FormElementComponent } from '../lib/components/forms/form-element.component';
import { define } from '../lib/util/define';
import { getTranslator, getTranslatorFor, MemoryTranslatorFactory, setTranslator, setTranslatorFactory, TRANSLATIONS_LOADED, Translator } from '@digita-ai/dgt-utils';


const emailValidator: FormValidator<{ email: string }> = async (context, event) => {

  if (!context.data) return [];

  const { email } = context.data;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const updatedField = (event as FormUpdatedEvent).field;
  
  // email checks
  if (updatedField === 'email') {

    if (!email || email.length < 1) {

      return [ { message: 'This field is required', field: 'email' } ];

    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/u;

    if (!emailRegex.test(email)) {

      return [ { message: 'Please enter a valid e-mail', field: 'email' } ];

    }

  }

  return [];

};

export type DemoFormModel = {
  email: string,
  textareaField: string,
  select: string,
};

export class DemoComponent extends RxLitElement {

  // eslint-disable-next-line max-len
  private formMachine: StateMachine<FormContext<DemoFormModel>, FormStateSchema<DemoFormModel>, FormEvent, FormState<DemoFormModel>>;
  // eslint-disable-next-line max-len
  private formActor: Interpreter<FormContext<DemoFormModel>, FormStateSchema<DemoFormModel>, FormEvent, FormState<DemoFormModel>>;

  private translator: Translator;

  constructor() {
    super();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.formMachine = createMachine<FormContext<DemoFormModel>, FormEvent, FormState<DemoFormModel>>(formMachine<DemoFormModel>(emailValidator)).withContext({
      data: { email: '', textareaField: '', select: 'first' },
      original: { email: '', textareaField: '', select: 'first' },
    });

    // eslint-disable-next-line no-console,@typescript-eslint/no-unsafe-assignment
    this.formActor = interpret(this.formMachine, { devTools: true }).onTransition((s) => {
      console.log(s.value);
      console.log('data', s.context.data)
    });
    this.formActor.start();

    define('checkbox-component', CheckboxComponent);
    define('form-element', FormElementComponent);

    // create single translator
    setTranslatorFactory(new MemoryTranslatorFactory);

  }

  async connectedCallback(): Promise<void> {

    this.translator = await getTranslatorFor(navigator.language);
    // set global translator
    setTranslator(this.translator);
    // to use in other components:
    this.translator = getTranslator();

    super.connectedCallback();

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
    <h1>translator</h1>
    <p>${this.translator.translate('example-translation')}</p>
    <h1>checkbox component</h1>
    <form>
      <checkbox-component @change="${this.onCheckboxClicked}">I agree</checkbox-component>
      <checkbox-component @change="${this.onCheckboxClicked}">I consent</checkbox-component>
      <checkbox-component @change="${this.onCheckboxClicked}">I would like to receive promotional e-mails</checkbox-component>
      <button disabled @click="${this.onButtonClicked}">Continue</button>
    </form>
    <h1>form element component</h1>
    <form>
      <input placeholder="non form-element input field">
      <form-element field="email" .actor=${this.formActor}>
        <input slot="input" type="email" name="email" id="email" placeholder="enter e-mail address">
      </form-element>
      <form-element field="textareaField" .actor=${this.formActor}>
        <textarea slot="input">GRA</textarea>
      </form-element>
      <form-element field="select" .actor=${this.formActor}>
        <select required slot="input" name="select" id="select">
          <option value="first">first</option>
          <option value="second">second</option>
        </select>
      </form-element>
      <div>
        <select id="non-form-select">
          <option value="non">non</option>
          <option value="form">form</option>
          <option value="select">select</option>
        </select>
      </div>
      <button>Continue</button>
    </form>

    <div class="progress-bars">
      <h1>Progress bar</h1>
      <progress-bar doUpdate="${true}">
        <div class="selected"></div>
        <div></div>
        <div></div>
      </progress-bar>
      <progress-bar doUpdate="${true}">
        <div></div>
        <div class="selected"></div>
        <div></div>
      </progress-bar>
    </div>
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
      h1 {
        margin: 0;
        padding: 0;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: var(--gap-small);
        padding: var(--gap-small);
        background-color: white;
      }
      input {
        width: 100%;
        box-sizing: border-box;
      }
      .progress-bars {
        background-color: #333;
        padding: var(--gap-normal);
        color: white;
      }
      `,
    ];

  }

}
