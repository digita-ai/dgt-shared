import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import moment from 'moment';

@Injectable()
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
