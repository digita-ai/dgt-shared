/**
 * A generic error.
 */
export class DGTError extends Error {

  /**
   * Name of the error.
   */
  public readonly name = DGTError.name;

  /**
   * Instantiates the error.
   *
   * @param messsage The error message.
   * @param cause The optional cause of this error.
   */
  constructor(messsage: string, public cause?: Error) {

    super(messsage);

    Object.setPrototypeOf(this, DGTError.prototype);

  }

}
