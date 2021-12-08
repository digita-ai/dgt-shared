import { DGTError } from './dgt-error.model';

/**
 * Thrown when an HTTP call fails.
 */
export class DGTErrorHttp extends DGTError {

  /**
   * {@inheritDoc DGTError.name}
   */
  public readonly name = DGTErrorHttp.name;

  /**
   * Instantiates the error.
   *
   * @param messsage The error message.
   * @param response The response to the http request.
   * @param cause The optional cause of this error.
   */
  constructor(message: string, public response: unknown, cause?: Error) {

    super(message, cause);

    Object.setPrototypeOf(this, DGTErrorHttp.prototype);

  }

}
