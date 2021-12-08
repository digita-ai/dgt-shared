import { DGTError } from './dgt-error.model';

/**
 * Thrown when a function's argument is incorrect.
 */
export class DGTErrorArgument extends DGTError {

  /**
   * {@inheritDoc DGTError.name}
   */
  public readonly name = DGTErrorArgument.name;

  /**
   * Instantiates the error.
   *
   * @param messsage The error message.
   * @param value The value of the argument.
   * @param cause The optional cause of this error.
   */
  constructor(message: string, public value: unknown, cause?: Error) {

    super(message, cause);

    Object.setPrototypeOf(this, DGTErrorArgument.prototype);

  }

}
