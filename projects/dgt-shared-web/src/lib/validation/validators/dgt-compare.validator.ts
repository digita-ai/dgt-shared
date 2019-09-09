import { ElementRef, Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl } from '@angular/forms';

@Injectable()
export class DGTCompareValidator {
  public validate(originalTextField: ElementRef, comparedTextField: ElementRef, errorField: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {

      if (comparedTextField.nativeElement.value !== originalTextField.nativeElement.value) {
        control.get(errorField).setErrors({ compare: true });
      }

      return null;
    };
  }
}
