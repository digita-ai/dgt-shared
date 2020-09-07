import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { FormGroup, FormControl } from '@angular/forms';
import { DGTDataValue } from '@digita/dgt-shared-data';

@Component({
  selector: 'dgt-data-value',
  templateUrl: './dgt-data-value.component.html',
  styleUrls: ['./dgt-data-value.component.scss']
})
/** The Data Value component is a detailed view of a single Data Value */
export class DGTDataValueComponent implements OnInit {

  /** The form to display the data in */
  public formGroup: FormGroup;

  /** The data value of this component */
  private _value: DGTDataValue;
  @Input()
  public get value(): DGTDataValue {
    return this._value;
  }
  public set value(value: DGTDataValue) {
    this._value = value;
    this.updateReceived(value);
  }

  /** Used to emit valueUpdated events */
  @Output()
  valueUpdated: EventEmitter<{value: DGTDataValue, newObject: any}>;

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService
  ) {
    this.formGroup = new FormGroup({
      subject: new FormControl(),
      object: new FormControl()
    });
    this.valueUpdated = new EventEmitter<{value: DGTDataValue, newObject: any}>();
  }

  ngOnInit() {
  }

  /**
   * On every update of the value input, update the form group values
   * @param values all values of this field
   */
  public updateReceived(value: DGTDataValue) {
    if (value && value.subject && value.object) {
      this.formGroup.setValue({
        subject: value.subject.value,
        object: value.object.value
      });
    } else {
      this.logger.debug(DGTDataValueComponent.name, 'value was not set', value);
    }
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(value: DGTDataValue, newObject: string): void {
    this.paramChecker.checkParametersNotNull({value, newObject});
    this.valueUpdated.emit({value, newObject});
    this.formGroup.markAsPristine();
  }
}
