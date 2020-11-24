
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import moment from 'moment';

@DGTInjectable()
export class DGTFormBeforeValidator {
  public validate(beforeDate: Date): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      let res: { [key: string]: any } = { 'before': true };

      if (beforeDate && control && control.value) {
        const beforeMoment = moment(beforeDate);
        const valueMoment = moment(control.value);

        if (valueMoment && beforeMoment && valueMoment.isBefore(beforeMoment)) {
          res = null;
        }
      } else if (beforeDate && control && !control.value) {
        res = null;
      }

      return res;
    };
  }
}
