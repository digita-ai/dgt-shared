import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import moment from 'moment';

@Injectable()
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
