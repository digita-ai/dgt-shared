import { DGTError } from './dgt-error.model';

/**
 * Thrown when a function has not been implemented.
 */
export class DGTErrorNotImplemented extends DGTError {

  /**
   * {@inheritDoc DGTError.name}
   */
  public readonly name = DGTErrorNotImplemented.name;

  /**
   * Instantiates the error.
   */
  constructor() {

    super('Function is not implemented');

    Object.setPrototypeOf(this, DGTErrorNotImplemented.prototype);

  }

}
