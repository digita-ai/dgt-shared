import { BaseError } from './base-error.model';

/**
 * Thrown when a function has not been implemented.
 */
export class NotImplementedError extends BaseError {

  /**
   * {@inheritDoc BaseError.name}
   */
  public readonly name = NotImplementedError.name;

  /**
   * Instantiates the error.
   */
  constructor() {

    super('Function is not implemented');

    Object.setPrototypeOf(this, NotImplementedError.prototype);

  }

}
