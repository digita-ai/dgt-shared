import { DGTError } from './dgt-error.model';

export class DGTErrorNotImplemented extends DGTError {

  public readonly name = DGTErrorNotImplemented.name;

  constructor() {

    super('Function is not implemented');

    Object.setPrototypeOf(this, DGTErrorNotImplemented.prototype);

  }

}
