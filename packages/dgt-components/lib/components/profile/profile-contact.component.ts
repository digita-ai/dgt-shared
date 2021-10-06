import { NamedNode, Store } from 'n3';
import { css, html, property, PropertyValues, TemplateResult, unsafeCSS } from 'lit-element';
import { ComponentResponseEvent } from '@digita-ai/semcom-sdk';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Image, Theme } from '@digita-ai/dgt-theme';
import { from, Observable, of } from 'rxjs';
import { interpret, Interpreter } from 'xstate';
import { map } from 'rxjs/operators';
import { DGTErrorNotImplemented } from '@digita-ai/dgt-utils';
import { FormCleanlinessStates, FormContext, formMachine, FormRootStates, FormSubmissionStates, FormValidationStates } from '../forms/form.machine';
import { BaseComponent } from '../base/base.component';
import { FormValidatorResult } from '../forms/form-validator-result';

export interface ProfileContactComponentForm {
  email: string;
  phone: string;
}

export class ProfileContactComponent extends BaseComponent {

  readonly foaf = 'http://xmlns.com/foaf/0.1/';
  readonly n = 'http://www.w3.org/2006/vcard/ns#';

  @property() formActor: Interpreter<FormContext<ProfileContactComponentForm>>;
  @property() canSave = false;

  /**
   * Is executed when a property value is updated.
   *
   * @param changed Map of changes properties.
   */
  update(changed: PropertyValues): void {

    super.update(changed);

    if (changed.has('entry') && this.entry) {

      this.readData(this.entry);

    }

    if(changed.has('formActor') && this.formActor){

      this.subscribe('canSave', from(this.formActor).pipe(
        map((state) => state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
            [FormRootStates.VALIDATION]: FormValidationStates.VALID,
          },
        })),
      ));

    }

  }

  /**
   * Handles a response event. Can be used to update the component's properties based on the data in the response.
   *
   * @param event The response event to handle.
   */
  handleResponse(event: ComponentResponseEvent): void {

    if (!event || !event.detail || !event.detail.data) {

      throw new Error('Argument event || !event.detail || !event.detail.quads should be set.');

    }

    const store = new Store(event.detail.data);

    const phones: string[] = [];
    const emails: string[] = [];

    store.getQuads(null, new NamedNode(`${this.n}hasTelephone`), null, null).map((tele) => {

      if(tele.object?.value.startsWith('tel:')) {

        phones.push(tele.object?.value.split(':')[1]);

      } else {

        phones.push(store.getQuads(new NamedNode(tele.object.value), new NamedNode(`${this.n}value`), null, null)[0]?.object.value.split(':')[1]);

      }

    });

    store.getQuads(null, new NamedNode(`${this.n}hasEmail`), null, null).map((mail) => {

      if(mail.object?.value.startsWith('mailto:')) {

        emails.push(mail.object?.value.split(':')[1]);

      } else {

        emails.push(store.getQuads(new NamedNode(mail.object.value), new NamedNode(`${this.n}value`), null, null)[0]?.object.value.split(':')[1]);

      }

    });

    this.formActor = interpret(formMachine<ProfileContactComponentForm>(
      /**
       * Validates the form.
       */
      (formContext): Observable<FormValidatorResult[]> => of([
        ...formContext.data.email ? [] : [ { field: 'email', message: 'Field is required' } as FormValidatorResult ],
        ...formContext.data.phone ? [] : [ { field: 'phone', message: 'Field is required' } as FormValidatorResult ],
      ]),
    )
      .withContext({
        data: { phone: phones[0], email: emails[0] },
        original: { phone: phones[0], email: emails[0] },
      }));

    this.formActor.start();

  }

  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
        div[slot="content"] {
          display: flex;
          flex-direction: column;
        }

        div[slot="content"] > * {
          margin-bottom: var(--gap-large);
        }
      `,
    ];

  }

  private handleSave() {

    throw new DGTErrorNotImplemented();

    // this.formActor.send(FormEvents.FORM_SUBMITTED);
    // this.writeData(this.entry, [
    //   new Quad(new NamedNode(this.entry), new NamedNode(`${this.foaf}name`), new Literal(this.formActor.state.context.data.fullName)),
    //   new Quad(new NamedNode(this.entry), new NamedNode(`${this.foaf}nick`), new Literal(this.formActor.state.context.data.nick)),
    //   new Quad(new NamedNode(this.entry), new NamedNode(`${this.n}honorific-prefix`), new Literal(this.formActor.state.context.data.honorific)),
    //   new Quad(new NamedNode(this.entry), new NamedNode(`${this.n}hasPhoto`), new Literal(this.formActor.state.context.data.image)),
    // ])

  }

  render(): TemplateResult {

    return this.formActor ? html`
        
    <nde-card .showImage="${false}">
      <div slot="title">Contact information</div>
      <div slot="subtitle">Your email address and phone number</div>
      <div slot="icon">
        ${unsafeSVG(Image)}
      </div>
      <div slot="content">
        <nde-form-element .actor="${this.formActor}" field="email">
          <label slot="label" for="email">
            Email address
          </label>
          <input type="text" slot="input" name="email"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" field="phone">
          <label slot="label" for="phone">
            Phone
          </label>
          <input type="text" slot="input" name="phone"/>
        </nde-form-element>
        <button class="primary" @click="${this.handleSave}" .disabled="${!this.canSave}">Save</button>
        </div>
      </nde-card>
      ` : html``;

  }

}

export default ProfileContactComponent;