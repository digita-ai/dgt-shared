
export const hydrate = (ctor: CustomElementConstructor) => (...params: any[]): CustomElementConstructor =>
  class extends ctor {

    constructor() { super(...params); }

  };
