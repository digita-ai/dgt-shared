/**
 * Represents a result of a form validation.
 */
export interface FormValidatorResult {
  /**
   * The field which was validated.
   */
  field: string;

  /**
   * A descriptive validation message.
   */
  message: string;
}
