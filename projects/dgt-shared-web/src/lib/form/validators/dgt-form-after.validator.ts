
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { DGTInjectable } from '@digita/dgt-shared-utils';
import moment from 'moment';

@DGTInjectable()
export class DGTFormAfterValidator {
  public validate(afterDate: Date): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      let res: { [key: string]: any } = { 'after': true };

      if (afterDate && control && control.value) {
        const afterMoment = moment(afterDate);
        const valueMoment = moment(control.value);

        if (valueMoment && afterMoment && valueMoment.isAfter(afterMoment)) {
          res = null;
        }
      } else if (afterDate && control && !control.value) {
        res = null;
      }

      return res;
    };
  }
}
