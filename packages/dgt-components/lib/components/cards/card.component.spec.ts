import { CardComponent } from './card.component';

describe('CardComponent', () => {

  let component: CardComponent;
  const tag = 'nde-large-card';

  beforeEach(() => {

    component = window.document.createElement(tag) as CardComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should display header, image and content', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    const largeCard = window.document.body.getElementsByTagName(tag)[0].shadowRoot;

    expect(largeCard.querySelector('nde-content-header')).toBeTruthy();
    expect(largeCard.querySelector('.image')).toBeTruthy();
    expect(largeCard.querySelector('.content')).toBeTruthy();

  });

  it('should not display header when showHeader is false', async () => {

    component.showHeader = false;
    window.document.body.appendChild(component);
    await component.updateComplete;

    const largeCard = window.document.body.getElementsByTagName(tag)[0].shadowRoot;

    expect(largeCard.querySelector('nde-content-header')).not.toBeTruthy();
    expect(largeCard.querySelector('.image')).toBeTruthy();
    expect(largeCard.querySelector('.content')).toBeTruthy();

  });

  it('should not display image when showImage is false', async () => {

    component.showImage = false;
    window.document.body.appendChild(component);
    await component.updateComplete;

    const largeCard = window.document.body.getElementsByTagName(tag)[0].shadowRoot;

    expect(largeCard.querySelector('nde-content-header')).toBeTruthy();
    expect(largeCard.querySelector('.image')).not.toBeTruthy();
    expect(largeCard.querySelector('.content')).toBeTruthy();

  });

  it('should not display content when showContent is false', async () => {

    component.showContent = false;
    window.document.body.appendChild(component);
    await component.updateComplete;

    const largeCard = window.document.body.getElementsByTagName(tag)[0].shadowRoot;

    expect(largeCard.querySelector('nde-content-header')).toBeTruthy();
    expect(largeCard.querySelector('.image')).toBeTruthy();
    expect(largeCard.querySelector('.content')).not.toBeTruthy();

  });

});
