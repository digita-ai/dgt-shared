import { html, property, unsafeCSS, css, CSSResult, TemplateResult, LitElement } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Theme, Loading } from '@useid/dgt-theme';

export class LoadingComponent extends LitElement {

  @property({ type: String })
    message: string;

  constructor() {

    super();

  }

  render(): TemplateResult {

    return html`
      <div class="loading-container">
        ${unsafeSVG(Loading)}
        ${this.message ? html`<p>${this.message}</p>` : undefined}
      </div>
    `;

  }

  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        .loading-container {
          width: var(--form-large);
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .loading-container svg {
          width: 150px;
          height: 150px;
        }
        .loading-container svg {
          stroke: var(--colors-foreground-normal);
        }
      `,
    ];

  }

}

export default LoadingComponent;

