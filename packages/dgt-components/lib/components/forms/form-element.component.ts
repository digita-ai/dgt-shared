import { css, CSSResult, html, internalProperty, property, PropertyValues, query, TemplateResult, unsafeCSS } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { ArgumentError, Translator, debounce } from '@digita-ai/dgt-utils';
import { Interpreter } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Loading, Theme } from '@digita-ai/dgt-theme';
import { FormContext, FormRootStates, FormState, FormStateSchema, FormSubmissionStates, FormValidationStates } from './form.machine';
import { FormValidatorResult } from './form-validator-result';
import { FormEvent, FormEvents, FormUpdatedEvent } from './form.events';

/**
 * A component which shows the details of a single collection.
 */
export class FormElementComponent<T> extends RxLitElement {

  /**
   * All input elements slotted in the form element.
   */
  @internalProperty()
  inputs: (HTMLInputElement | HTMLTextAreaElement)[];

  /**
   * The slot element which contains the input field.
   */
  @query('slot[name="input"]')
  inputSlot: HTMLSlotElement;

  /**
   * Decides whether a border should be shown around the content
   */
  @property()
  public inverse = false;

  /**
   * Decides whether the label should be shown
   */
  @property()
  public showLabel = true;

  /**
   * The component's translator.
   */
  @property({ type: Translator })
  public translator: Translator;

  /**
   * The name of the data attribute edited by the form element.
   */
  @property({ type: String })
  public field: keyof T;

  /**
   * The element's form validation results.
   */
  @internalProperty()
  public validationResults: FormValidatorResult[];

  /**
   * Indicates if the element's loading icon should be shown.
   */
  @internalProperty()
  public showLoading = false;

  /**
   * Indicates if the form should submit on keypress = enter.
   */
  @internalProperty()
  public submitOnEnter = true;

  /**
   * Indicates if the form's input should be locked.
   */
  @internalProperty()
  public lockInput = false;

  /**
   * Timeout to use when debouncing input.
   */
  @property()
  public debounceTimeout = 500;

  /**
   * The element's data.
   */
  @internalProperty()
  public data: T;

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  actor: Interpreter<FormContext<T>, FormStateSchema<T>, FormEvent, FormState<T>>;

  /**
   * Hook called on every update after connection to the DOM.
   */
  updated(changed: PropertyValues): void {

    super.updated(changed);

    if(changed.has('actor') && this.actor) {

      // Subscribes to the field's validation results.
      this.subscribe('validationResults', from(this.actor).pipe(
        map((state) => state.context?.validation?.filter((result) => result.field === this.field)),
      ));

      // Subscribes to data in the actor's context.
      this.subscribe('data', from(this.actor).pipe(
        map((state) => state.context?.data),
      ));

      // Subscribes to data in the actor's context.
      this.subscribe('showLoading', from(this.actor).pipe(
        map((state) => state.matches(FormSubmissionStates.SUBMITTING) || state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.VALIDATION]: FormValidationStates.VALIDATING,
          },
        })),
      ));

      // Subscribes to data in the actor's context.
      this.subscribe('lockInput', from(this.actor).pipe(
        map((state) => state.matches(FormSubmissionStates.SUBMITTING)
        || state.matches(FormSubmissionStates.SUBMITTED)),
        tap((lock) => {

          this.inputs?.forEach((element) => element.disabled = lock);

        })
      ));

      if (this.inputSlot && this.field && this.data) {

        this.bindActorToInput(this.inputSlot, this.actor, this.field, this.data);

      }

    }

  }

  /**
   * Binds default data and event listener for input form.
   */
  bindActorToInput(
    slot: HTMLSlotElement,
    actor: Interpreter<FormContext<T>, FormStateSchema<T>, FormEvent, FormState<T>>,
    field: keyof T,
    data: T,
  ): void {

    if (!slot) {

      throw new ArgumentError('Argument slot should be set.', slot);

    }

    if (!actor) {

      throw new ArgumentError('Argument actor should be set.', actor);

    }

    if (!field) {

      throw new ArgumentError('Argument field should be set.', field);

    }

    if (!data) {

      throw new ArgumentError('Argument data should be set.', data);

    }

    this.inputs = slot.assignedNodes({ flatten: true })?.filter(
      (element) => element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement,
    ).map((element) => element as HTMLInputElement | HTMLTextAreaElement);

    this.inputs?.forEach((element) => {

      // Set the input field's default value.
      const fieldData = data[this.field];
      element.value = typeof fieldData === 'string' ? fieldData : '';

      // Send event when input field's value changes.
      element.addEventListener('input', debounce(() => actor.send({ type: FormEvents.FORM_UPDATED, value: element.value, field } as FormUpdatedEvent), this.debounceTimeout));

      // Listen for Enter presses to submit
      if (this.submitOnEnter) {

        element.addEventListener('keypress', (event: KeyboardEvent) => {

          if (event.key === 'Enter') {

            actor.send({ type: FormEvents.FORM_SUBMITTED });

          }

        });

      }

    });

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
    <div class="form-element">
      ${this.showLabel
    ? html`
          <div class="label">
            <slot name="label"></slot>
          </div>
        ` : ''
}
      <div class="content">
        <div class="field ${this.inverse ? 'no-border' : ''}">
          <slot name="input"></slot>
          <div class="icon">
            ${this.showLoading ? html`<div class="loading">${ unsafeSVG(Loading) }</div>` : html`<slot name="icon"></slot>`}
          </div>
        </div>
        <div class="action">
          <slot name="action" class="${this.inverse ? 'no-border' : ''}"></slot>
        </div>
      </div>
      <div class="help" ?hidden="${this.validationResults && this.validationResults?.length > 0}">
        <slot name="help"></slot>
      </div>
      <div class="results" ?hidden="${!this.validationResults || this.validationResults.length === 0}">
        ${this.validationResults?.map((result) => html`<div class="result">${this.translator ? this.translator.translate(result.message) : result.message}</div>`)}
      </div>
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
        :root {
          display: block;
        }
        .loading svg .loadCircle {
          stroke: var(--colors-primary-normal);
        }
        .no-border, .no-border ::slotted(*) {
          border: none !important;
        }
        .form-element {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .form-element .label {
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--gap-small);
        }
        .form-element .content {
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: stretch;
        }
        .form-element .content .action ::slotted(button){
          height: 100%;
        }
        .form-element .content .field {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          justify-content: space-between;
          width: 100%;
        }
        .form-element .content .field .icon {
          height: 100%;
          display: flex;
          align-items: center;
        }
        .form-element .content .field .icon ::slotted(*), .form-element .content .field .icon div svg  {
          padding-right: var(--gap-normal);
          max-height: var(--gap-normal);
          max-width: var(--gap-normal);
          height: var(--gap-normal);
          width: var(--gap-normal);
        }
        .form-element .results .result {
          background-color: var(--colors-status-warning);
          padding: var(--gap-tiny) var(--gap-normal);
          font-size: var(--font-size-small);
        }
      `,
    ];

  }

}
