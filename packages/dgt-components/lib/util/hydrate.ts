
export const hydrate = (ctor: CustomElementConstructor) => (... params: any[]): CustomElementConstructor =>
  class extends ctor {

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    constructor() { super(... params); }

  };
