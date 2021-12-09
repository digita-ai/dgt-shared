import { ArgumentError } from '../../errors/models/argument-error';

/** A service to check the validity of parameters */
export class DGTParameterCheckerService {

  /**
   * Check if variables are null
   *
   * @param parameterList a list of all the parameters to be checked
   * @param depth you only want to set this parameter if you want to test
   * an object containing an object. 'infinity' can be entered to check unlimited depth.
   * by default the function will not check objects inside of objects
   * @throws ArgumentError if null values are found
   */
  checkParametersNotNull(parameterList: any, depth = 0): void {

    this.checkParametersNotNullHelper(parameterList, depth);

  }
  private checkParametersNotNullHelper(parameterList: any, depth = 0, previous = ''): void {

    if (depth >= 0 && parameterList && Object.entries(parameterList).length > 0) {

      Object.entries(parameterList).forEach((entry) => {

        const key = entry[0];
        const value = entry[1];

        if (!value && value !== 0) {

          throw new ArgumentError(previous + key + ' should be set', value);

        }

        if (value && typeof value === 'object') {

          this.checkParametersNotNullHelper({ ...value }, depth - 1, previous + key + '.');

        }

      });

    }

  }

}
