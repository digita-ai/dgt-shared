import { html, internalProperty, TemplateResult, property, PropertyValues } from 'lit-element';
import { createMachine, DoneEvent, interpret, Interpreter, State, StateMachine } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SolidSDKService } from '../../services/solid-sdk.service';
import { Issuer } from '../../models/issuer.model';
import { AuthenticateContext, AuthenticateEvent, authenticateMachine, AuthenticateState, AuthenticateStates, AuthenticateStateSchema, SelectedIssuerEvent, WebIdEnteredEvent } from './authenticate.machine';

export class AuthenticateComponent extends RxLitElement {

  private actor: Interpreter<AuthenticateContext, AuthenticateStateSchema, AuthenticateEvent, AuthenticateState>;
  private machine: StateMachine<AuthenticateContext, AuthenticateStateSchema, AuthenticateEvent, AuthenticateState>;

  @internalProperty()
  state?: State<AuthenticateContext>;

  @internalProperty()
  issuers?: Issuer[];

  @property({ type: Object }) solidService: SolidSDKService;

  constructor() {

    super();

  }

  updated(changed: PropertyValues): void {

    super.updated(changed);

    if (changed.has('solidService')) {

      if (this.actor) this.actor.stop();

      this.machine = createMachine(authenticateMachine(this.solidService));

      // eslint-disable-next-line no-console
      this.actor = interpret(this.machine, { devTools: true }).onTransition((state) => console.log(state.value));

      this.subscribe('state', from(this.actor));
      this.subscribe('issuers', from(this.actor).pipe(map((state) => state.context.issuers)));

      this.actor.onDone((event: DoneEvent) => { this.dispatchEvent(new CustomEvent('authenticated', { detail: event.data.session })); });

      this.actor.start();

    }

  }

  onSubmit = (event: CustomEvent): void => {

    event.preventDefault();
    this.actor.send(new WebIdEnteredEvent(event.detail));

  };

  onButtonCreateWebIDClick = (): void => { this.dispatchEvent(new CustomEvent('create-webid')); };

  render(): TemplateResult {

    return html`
      ${ this.state?.matches(AuthenticateStates.AWAITING_WEBID) ? html`
      <webid-form @submit-webid="${this.onSubmit}" @create-webid="${this.onButtonCreateWebIDClick}"></webid-form>
      ` : this.state?.matches(AuthenticateStates.SELECTING_ISSUER) ? html`
        <provider-list @issuer-selected="${(event: CustomEvent) => this.actor.send(new SelectedIssuerEvent(event.detail))}" .providers="${this.issuers}">
        </provider-list>
      ` : html` <loading-component></loading-component> `}
    `;

  }

}

export default AuthenticateComponent;
