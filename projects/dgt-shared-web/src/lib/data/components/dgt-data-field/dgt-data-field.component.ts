import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DGTDataValue } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';

@Component({
  selector: 'dgt-data-field',
  templateUrl: './dgt-data-field.component.html',
  styleUrls: ['./dgt-data-field.component.scss'],
})
/** The Data Field component shows a text representation of a value */
export class DGTDataFieldComponent {

  public formGroup: FormGroup;

  /** The values for this field */
  private _value: DGTDataValue;
  public get value(): DGTDataValue {
    return this._value;
  }
  @Input() public set value(value: DGTDataValue) {
    this._value = value;
    this.formGroup.setValue({desc: this.value.object.value});
  }

  /** Used to emit valueUpdated events */
  @Output()
  valueUpdated: EventEmitter<{value: DGTDataValue, newObject: any}>;
  /** Used to emit updateValue events */
  @Output()
  submit: EventEmitter<any>;

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
  ) {
    this.formGroup = new FormGroup({
      desc: new FormControl(),
    });
    this.valueUpdated = new EventEmitter();
    this.submit = new EventEmitter();
  }

  /**
   * @param value Value to update
   * @param newObject the object value to update to
   * @param keypress keyboardevent
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(value: DGTDataValue, newObject: any, keypress: KeyboardEvent): void {
    this.paramChecker.checkParametersNotNull({value, newObject});
    if (keypress.key === 'Enter') {
      this.submit.emit();
    } else {
      this.valueUpdated.emit({value, newObject});
    }
  }
}
