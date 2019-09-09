
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { DGTAuthService } from '../../security/services/dgt-auth.service';
import { Observable } from 'rxjs';
import { DGTLoggerService } from '@digita/dgt-shared-utils';

@Injectable()
export class DGTEmailUniqueValidator {
  constructor(private auth: DGTAuthService, private logger: DGTLoggerService) { }

  public validate(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      this.logger.debug(DGTEmailUniqueValidator.name, 'Preparing observable to check if email is unique for control.', control);

      return this.auth.checkIfEmailExists(control.value).pipe(
        map(exists => (exists ? { emailUnique: true } : null)));
    };
  }
}
