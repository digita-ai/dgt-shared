import { html, internalProperty, TemplateResult, property, unsafeCSS, CSSResultArray, css } from 'lit-element';
import { createMachine, DoneEvent, interpret, Interpreter, State, StateMachine } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Theme, DigitaBlue } from '@digita-ai/dgt-theme';
import { SolidService } from '@digita-ai/inrupt-solid-service';
import { Issuer } from '../../models/issuer.model';
import { ProviderListComponent } from '../provider/provider-list.component';
import { SeparatorComponent } from '../separator/separator.component';
import { LoadingComponent } from '../loading/loading.component';
import { define } from '../../util/define';
import { Translator } from '../../services/i18n/translator';
import { WebIdComponent } from './webid.component';
import { AuthenticateContext, AuthenticateEvent, AuthenticateEvents, authenticateMachine, AuthenticateState, AuthenticateStates, AuthenticateStateSchema, ClickedLoginEvent, SelectedIssuerEvent, WebIdEnteredEvent, WebIdValidator } from './authenticate.machine';

export class AuthenticateComponent extends RxLitElement {

  private actor: Interpreter<AuthenticateContext, AuthenticateStateSchema, AuthenticateEvent, AuthenticateState>;
  private machine: StateMachine<AuthenticateContext, AuthenticateStateSchema, AuthenticateEvent, AuthenticateState>;

  @internalProperty()
  state?: State<AuthenticateContext>;

  @internalProperty()
  issuers?: Issuer[];

  @property({ type: Boolean }) hideWebId = false;
  @property({ type: Boolean }) hideIssuers = false;
  @property({ type: Boolean }) hideCreateNewWebId = false;
  @property() webIdValidationResults: string[];
  @property({ type: Translator }) translator?: Translator;

  @property({ type: Array }) trusted: string[];

  @property({ type: Array }) predefinedIssuers: Issuer[] = [
    { description: 'Digita', icon: DigitaBlue, uri: 'https://solidcommunity.net' },
    { description: 'Inrupt', icon: 'https://inrupt.com/static/inrupt-social_0-372b94bf42bea86a81cc362e0c99d115.jpg', uri: 'https://inrupt.net/' },
  ];

  @property({ type: String }) textSeparator = 'or';
  @property({ type: String }) textWebIdLabel = 'WebID';
  @property({ type: String }) textWebIdPlaceholder = 'Please enter your WebID';
  @property({ type: String }) textNoWebId = 'No WebID yet?';
  @property({ type: String }) textButton = 'Connect';

  constructor(solidService: SolidService, trustedIssuers?: string[], webIdValidator?: WebIdValidator) {

    super();

    define('provider-list', ProviderListComponent);
    define('webid-form', WebIdComponent);
    define('separator-component', SeparatorComponent);
    define('loading-component', LoadingComponent);

    this.machine = createMachine(authenticateMachine(solidService))
      .withContext({
        trusted: trustedIssuers,
        webIdValidator,
      });

    // eslint-disable-next-line no-console
    this.actor = interpret(this.machine, { devTools: true }).onTransition((state) => console.log(state.value));

    this.subscribe('state', from(this.actor));
    this.subscribe('issuers', from(this.actor).pipe(map((state) => state.context.issuers)));

    this.subscribe('webIdValidationResults', from(this.actor).pipe(map((state) => {

      if (state.matches(AuthenticateStates.AWAITING_LOGIN)) {

        return [];

      } else if (state.event.type === AuthenticateEvents.LOGIN_ERROR) {

        this.dispatchEvent(new CustomEvent('authenticate-error', { detail: state.event.results }));

        return state.event.results;

      } else {

        return this.webIdValidationResults;

      }

    })));

    this.actor.onDone((event: DoneEvent) => {

      if (event.data.session) this.dispatchEvent(new CustomEvent('authenticated', { detail: event.data.session }));
      if (event.data.webId) this.dispatchEvent(new CustomEvent('no-trust', { detail: event.data.webId }));

    });

    this.actor.start();

  }

  onSubmit = (event: CustomEvent): void => {

    event.preventDefault();
    this.actor.send(new ClickedLoginEvent(event.detail));

  };

  onWebIdChange = (event: CustomEvent): void => {

    event.preventDefault();
    this.actor.send(new WebIdEnteredEvent(event.detail));

  };

  onButtonCreateWebIDClick = (): void => { this.dispatchEvent(new CustomEvent('create-webid', { bubbles: true })); };

  render(): TemplateResult {

    return html`
      ${ !this.state?.hasTag('loading') ? html`

        <provider-list
          exportparts="provider, provider-description, provider-logo"
          ?hidden="${this.hideIssuers}"
          @issuer-selected="${(event: CustomEvent) => this.actor.send(new SelectedIssuerEvent(event.detail))}"
          .providers="${this.predefinedIssuers}"
        >
          <slot name="beforeIssuers" slot="before"></slot>
          <slot name="afterIssuers" slot="after"></slot>
        </provider-list>

        <separator-component
          part="separator"
          ?hidden="${this.hideIssuers || this.hideWebId}">
          ${ this.textSeparator }
        </separator-component>

        <webid-form
          exportparts="webid-label, webid-input, webid-create, webid-button, alert, webid-form, webid-input-container"
          ?hidden="${this.hideWebId}"
          ?hideCreateNewWebId="${this.hideCreateNewWebId}"
          ?disableLogin="${!this.state.matches(AuthenticateStates.AWAITING_LOGIN)}"
          @change-webid="${this.onWebIdChange}"
          @submit-webid="${this.onSubmit}"
          @create-webid="${this.onButtonCreateWebIDClick}"
          .textLabel="${this.textWebIdLabel}"
          .textPlaceholder="${this.textWebIdPlaceholder}"
          .textNoWebId="${this.textNoWebId}"
          .textButton="${this.textButton}"
          .validationResults="${this.webIdValidationResults}"
          .translator="${this.translator}"
        >
          <slot name="beforeWebId" slot="before"></slot>
          <slot name="afterWebId" slot="after"></slot>
        </webid-form>
       ` : html` ${ this.state?.matches(AuthenticateStates.SELECTING_ISSUER) ? html`
        <provider-list @issuer-selected="${(event: CustomEvent) => this.actor.send(new SelectedIssuerEvent(event.detail))}" .providers="${this.issuers}"></provider-list>`
    : html`<loading-component part="loading"></loading-component>` }
    `}`;

  }

  static get styles(): CSSResultArray {

    return [
      unsafeCSS(Theme),
      css`
      
      separator-component {
        margin: var(--gap-large) 0;
      }
      `,
    ];

  }

}

export default AuthenticateComponent;
