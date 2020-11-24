import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTCategory } from '@digita-ai/dgt-shared-data';
import { FormGroup, FormControl } from '@angular/forms';
import { DGTDataValue, DGTDataInterface } from '@digita-ai/dgt-shared-data';

@Component({
  selector: 'dgt-data-interface-descent',
  templateUrl: './dgt-data-interface-descent.component.html',
  styleUrls: ['./dgt-data-interface-descent.component.scss']
})
export class DGTDataInterfaceDescentComponent implements OnInit, DGTDataInterface {

  /** The form to display the data in */
  public formGroup: FormGroup;

  /** the category of this component */
  private _category: DGTCategory;
  public get category(): DGTCategory {
    return this._category;
  }
  @Input() public set category(category: DGTCategory) {
    this._category = category;

    if (this.values && this.category) {
      this.updateReceived(this.values, this.category);
    }
  }

  /** values needed to display descent data */
  private _values: DGTDataValue[];
  public get values(): DGTDataValue[] {
    return this._values;
  }
  @Input() public set values(values: DGTDataValue[]) {
    this._values = values;

    if (this.values && this.category) {
      this.updateReceived(this.values, this.category);
    }
  }

  public gender: string;
  public dateOfBirth: string;
  public placeOfBirth: string;

  /** Used to emit feedbackEvent events */
  @Output()
  valueUpdated: EventEmitter<{ value: DGTDataValue, newObject: any }>;

  /** Used to emit submit events */
  @Output()
  submit: EventEmitter<any>;

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService
  ) {
    this.valueUpdated = new EventEmitter();
    this.submit = new EventEmitter();

    this.formGroup = new FormGroup({
      gender: new FormControl(),
      dateOfBirth: new FormControl(),
      placeOfBirth: new FormControl(),
  });
  }

  ngOnInit() {
  }

  private updateReceived(values: DGTDataValue[], category: DGTCategory) {
    this.logger.debug(DGTDataInterfaceDescentComponent.name, 'Update received', { values, category });
    this.paramChecker.checkParametersNotNull({values, category});

    const genderReferences = values.filter(genderReference => {
      const genderReferenceObject = genderReference.object.value;
      const isHasGender = genderReference.predicate === 'http://www.w3.org/2006/vcard/ns#hasGender';
      const hasGenderType = values.find(value => value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' && value.object.value === 'http://www.w3.org/2006/vcard/ns#Gender' && value.subject.value === genderReferenceObject) ? true : false;
      const hasGenderValue = values.find(value => value.predicate === 'http://www.w3.org/2006/vcard/ns#value' && value.subject.value === genderReferenceObject) ? true : false;

      this.logger.debug(DGTDataInterfaceDescentComponent.name, 'Checking gender reference', { genderReference, isHasGender, hasGenderType, hasGenderValue });
      return isHasGender && hasGenderType && hasGenderValue;
    });

    this.logger.debug(DGTDataInterfaceDescentComponent.name, 'Filtered gender references', { genderRederences: genderReferences });

    if (genderReferences && genderReferences.length > 0) {
      const genderReference = genderReferences[0];
      const genderReferenceObject = genderReference.object.value;
      const genderValue = values.find(value => value.predicate === 'http://www.w3.org/2006/vcard/ns#value' && value.subject.value === genderReferenceObject);

      this.logger.debug(DGTDataInterfaceDescentComponent.name, 'Retrieved gender value for first gender reference', { genderReference, genderValue });

      if (genderValue) {
        this.gender = genderValue.object.value;
      }
    }

    const dateOfBirthValue = values.find(value => value.predicate === 'http://www.w3.org/2006/vcard/ns#bday');

    if (dateOfBirthValue) {
      this.dateOfBirth = dateOfBirthValue.object.value;
    }

    const placeOfBirthValue = values.find(value => value.predicate === 'https://www.w3.org/ns/person#placeOfBirth');

    if (placeOfBirthValue) {
      this.placeOfBirth = placeOfBirthValue.object.value;
    }

    this.formGroup.patchValue({
      gender: this.gender,
      dateOfBirth: this.dateOfBirth,
      placeOfBirth: this.placeOfBirth
  });
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(val: { value: DGTDataValue, newObject: any }): void {
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
