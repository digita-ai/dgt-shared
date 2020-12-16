import { AfterContentInit, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DGTFormElementComponent } from '../dgt-form-element/dgt-form-element.component';

@Component({
  selector: 'dgt-form',
  templateUrl: './dgt-form.component.html',
  styleUrls: ['./dgt-form.component.scss'],
})
export class DGTFormComponent implements AfterContentInit {

  @Input() public inline = false;

  private _formGroup: FormGroup = null;

  @Input()
  set formGroup(formGroup: FormGroup) {
    this._formGroup = formGroup;

    this.updateFormGroup(formGroup);
  }

  get formGroup(): FormGroup { return this._formGroup; }

  @ContentChildren(DGTFormElementComponent) public elementComponents: QueryList<DGTFormElementComponent>;

  constructor() { }

  ngAfterContentInit() {
    this.updateFormGroup(this.formGroup);
  }

  public updateFormGroup(formGroup: FormGroup) {
    if (this.elementComponents) {
      this.elementComponents.forEach(element => {
        element.formGroup = this.formGroup;
        element.inline = this.inline;
      });
    }
  }

}
