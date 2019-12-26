import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'dgt-form-validation',
  templateUrl: './dgt-form-validation.component.html',
  styleUrls: ['./dgt-form-validation.component.scss']
})
export class DGTFormValidationComponent implements OnInit {

  private _control: AbstractControl = null;

  @Input()
  set control(control: AbstractControl) {
    this._control = control;
  }

  get control(): AbstractControl { return this._control; }

  private _validationName: string = null;

  @Input()
  set validationName(validationName: string) {
    this._validationName = validationName;
  }

  get validationName(): string { return this._validationName; }

  public get showMessage(): boolean {
    let res = false;

    if (this.control && this.control.errors && this.validationName) {
      res = this.control.errors[this.validationName] != null;
    }

    return res;
  }

  constructor() { }

  ngOnInit() {
  }

}
