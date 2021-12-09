import { BaseError } from './base-error.model';

/**
 * Thrown when an HTTP call fails.
 */
export class HttpError extends BaseError {

  /**
   * {@inheritDoc BaseError.name}
   */
  public readonly name = HttpError.name;

  /**
   * Instantiates the error.
   *
   * @param messsage The error message.
   * @param response The response to the http request.
   * @param cause The optional cause of this error.
   */
  constructor(message: string, public response: unknown, cause?: Error) {

    super(message, cause);

    Object.setPrototypeOf(this, HttpError.prototype);

  }

}
