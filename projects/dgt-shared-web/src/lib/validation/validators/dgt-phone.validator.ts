
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import AwesomePhonenumber from 'awesome-phonenumber';

@DGTInjectable()
export class DGTPhoneValidator {
  public validate(defaultCountry: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      let res: { [key: string]: any } = { phone: true };

      if (defaultCountry && control && control.value) {
        const validator: AwesomePhonenumber = new AwesomePhonenumber(control.value, defaultCountry);

        if (validator.isValid()) {
          res = null;
        }
      } else if (defaultCountry && control && !control.value) {
        res = null;
      }

      return res;
    };
  }

  public parse(defaultCountry: string, phoneNumber: string) {
    let res = '';

    if (defaultCountry && phoneNumber) {
      const validator: AwesomePhonenumber = new AwesomePhonenumber(phoneNumber, defaultCountry);

      res = validator.getNumber();
    }

    return res;
  }
}
