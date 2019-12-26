import { Component, ContentChildren, QueryList, Input, AfterContentInit } from '@angular/core';
import { DGTFormValidationComponent } from '../dgt-form-validation/dgt-form-validation.component';
import { DGTFormControlComponent } from '../dgt-form-control/dgt-form-control.component';
import { AbstractControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'dgt-form-element',
  templateUrl: './dgt-form-element.component.html',
  styleUrls: ['./dgt-form-element.component.scss']
})
export class DGTFormElementComponent implements AfterContentInit {
  public inline = false;

  private _controlName: string = null;

  @Input()
  set controlName(controlName: string) {
    this._controlName = controlName;

    this.updateFormGroup(this.formGroup, this.controlName);
  }

  get controlName(): string { return this._controlName; }

  private _formGroup: FormGroup = null;

  @Input()
  set formGroup(formGroup: FormGroup) {
    this._formGroup = formGroup;

    this.updateFormGroup(this.formGroup, this.controlName);
  }

  get formGroup(): FormGroup { return this._formGroup; }

  public control: AbstractControl;

  @ContentChildren(DGTFormControlComponent) public controlComponents: QueryList<DGTFormControlComponent>;
  @ContentChildren(DGTFormValidationComponent) public validationComponents: QueryList<DGTFormValidationComponent>;

  public get showValidation(): boolean {
    let res = false;

    if (this.control) {
      res = this.control.invalid && (this.control.dirty || this.control.touched);
    }

    return res;
  }

  constructor() { }

  ngAfterContentInit() {

  }

  public updateFormGroup(formGroup: FormGroup, controlName: string) {
    if (formGroup && controlName) {
      this.control = this.formGroup.controls[controlName];

      this.controlComponents.forEach(element => element.control = this.control);
      this.validationComponents.forEach(element => element.control = this.control);
    }
  }

}
