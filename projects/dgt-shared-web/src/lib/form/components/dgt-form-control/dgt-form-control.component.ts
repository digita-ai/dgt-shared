import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'dgt-form-control',
  templateUrl: './dgt-form-control.component.html',
  styleUrls: ['./dgt-form-control.component.scss']
})
export class DGTFormControlComponent implements OnInit {

  private _control: AbstractControl = null;

  @Input()
  set control(control: AbstractControl) {
    this._control = control;
  }

  get control(): AbstractControl { return this._control; }

  constructor() { }

  ngOnInit() {
  }

}
