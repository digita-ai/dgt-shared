import { DGTError } from './dgt-error.model';

export class DGTErrorHttp extends DGTError {

  public readonly name = DGTErrorHttp.name;

  constructor(message: string, public value: any) {

    super(message);

    Object.setPrototypeOf(this, DGTErrorHttp.prototype);

  }

}
