
import { DGTInjectable } from '../../decorators/dgt-injectable';
import { DGTErrorArgument } from '../../errors/models/dgt-error-argument.model';

@DGTInjectable()
/** A service to check the validity of parameters */
export class DGTParameterCheckerService {

  constructor() {}
  /**
   * Check if variables are null
   * @param parameterList a list of all the parameters to be checked
   * @param depth you only want to set this parameter if you want to test
   * an object containing an object. 'infinity' can be entered to check unlimited depth.
   * by default the function will not check objects inside of objects
   * @throws DGTErrorArgument if null values are found
   */
  public checkParametersNotNull(parameterList: {}, depth: number = 0): void {
    this.checkParametersNotNullHelper(parameterList, depth);
  }
  private checkParametersNotNullHelper(parameterList: {}, depth: number = 0, previous: string = ''): void {
    if (depth >= 0 && parameterList && Object.entries(parameterList).length > 0) {
      Object.entries(parameterList).forEach(entry => {
        const key = entry[0];
        const value = entry[1];
        if (!value && value !== 0) {
          throw new DGTErrorArgument(previous + key + ' should be set', value);
        }
        if (value && typeof value === 'object') {
          this.checkParametersNotNullHelper({ ...value }, depth - 1, previous + key + '.');
        }
      });
    }
  }
}
