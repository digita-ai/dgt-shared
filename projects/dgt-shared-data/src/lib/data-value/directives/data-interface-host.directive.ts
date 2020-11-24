import { Directive, ViewContainerRef, EventEmitter, Output } from '@angular/core';
import { DGTDataValue } from '../models/data-value.model';
import { DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';

@Directive({
  selector: '[dgtDataInterfaceHost]',
})
export class DGTDataInterfaceHostDirective {
  /** Used to emit valueUpdated events */
  @Output()
  valueUpdated: EventEmitter<{value: DGTDataValue, newObject: any}>;
  /** Used to emit submit events */
  @Output()
  submit: EventEmitter<any>;

  constructor(
    public viewContainerRef: ViewContainerRef,
    private paramChecker: DGTParameterCheckerService
  ) {
    this.valueUpdated = new EventEmitter();
    this.submit = new EventEmitter();
  }


  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(val: {value: DGTDataValue, newObject: any}): void {
  this.paramChecker.checkParametersNotNull({val}, 1);
  this.valueUpdated.emit(val);
  }

  /**
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onSubmit(): void {
    this.submit.emit();
  }

}
