
export const define = (tag: string, module: CustomElementConstructor): void => {

  if (!customElements.get(tag)) customElements.define(tag, module);

};
