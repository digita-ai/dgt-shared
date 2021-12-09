import { BaseError } from './base-error.model';

/**
 * Thrown when a function's argument is incorrect.
 */
export class ArgumentError extends BaseError {

  /**
   * {@inheritDoc BaseError.name}
   */
  public readonly name = ArgumentError.name;

  /**
   * Instantiates the error.
   *
   * @param messsage The error message.
   * @param value The value of the argument.
   * @param cause The optional cause of this error.
   */
  constructor(message: string, public value: unknown, cause?: Error) {

    super(message, cause);

    Object.setPrototypeOf(this, ArgumentError.prototype);

  }

}
