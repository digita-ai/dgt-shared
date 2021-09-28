import { DGTError } from './dgt-error.model';

export class DGTErrorConfig extends DGTError {

  public readonly name = DGTErrorConfig.name;

  constructor(message: string, public value: any) {

    super(message);

    Object.setPrototypeOf(this, DGTErrorConfig.prototype);

  }

}
