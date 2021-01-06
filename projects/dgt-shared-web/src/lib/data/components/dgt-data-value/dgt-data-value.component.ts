import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';

@Component({
  selector: 'dgt-data-value',
  templateUrl: './dgt-data-value.component.html',
  styleUrls: ['./dgt-data-value.component.scss'],
})
/** The Data Value component is a detailed view of a single Data Value */
export class DGTDataValueComponent implements OnInit {

  /** The form to display the data in */
  public formGroup: FormGroup;

  /** The data value of this component */
  private _value: DGTLDResource;
  @Input()
  public get value(): DGTLDResource {
    return this._value;
  }
  public set value(value: DGTLDResource) {
    this._value = value;
    this.updateReceived(value);
  }

  /** Used to emit valueUpdated events */
  @Output()
  valueUpdated: EventEmitter<{value: DGTLDResource, newObject: any}>;

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
  ) {
    this.formGroup = new FormGroup({
      subject: new FormControl(),
      object: new FormControl(),
    });
    this.valueUpdated = new EventEmitter<{value: DGTLDResource, newObject: any}>();
  }

  ngOnInit() {
  }

  /**
   * On every update of the value input, update the form group values
   * @param values all values of this field
   */
  public updateReceived(value: DGTLDResource) {
    if (value && value.triples) {
      this.formGroup.setValue({
        subject: value.triples[0].subject.value,
        object: value.triples[0].object.value,
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
  public onValueUpdated(value: DGTLDResource, newObject: string): void {
    this.paramChecker.checkParametersNotNull({value, newObject});
    this.valueUpdated.emit({value, newObject});
    this.formGroup.markAsPristine();
  }
}
