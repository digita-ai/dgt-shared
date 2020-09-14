import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { DGTLoggerService, DGTMap, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTCategory } from '@digita/dgt-shared-data';
import { DGTDataValue, DGTDataInterface } from '@digita/dgt-shared-data';

@Component({
  selector: 'dgt-data-interface-email',
  templateUrl: './dgt-data-interface-email.component.html',
  styleUrls: ['./dgt-data-interface-email.component.scss']
})
export class DGTDataInterfaceEmailComponent implements OnInit, DGTDataInterface {

  /** The category of this component */
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

  /** all DGTDataValues of which we want to display the email */
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

  public emails: DGTMap<DGTDataValue, { email: string, type: string }>;

  private emailValues: DGTDataValue[];

  /** Used to emit feedbackEvent events */
  @Output()
  valueUpdated: EventEmitter<{value: DGTDataValue, newObject: any}>;

  /** Used to emit submit events */
  @Output()
  submit: EventEmitter<any>;

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService
  ) {
    this.valueUpdated = new EventEmitter();
    this.submit = new EventEmitter();
  }

  ngOnInit() { }

  private updateReceived(values: DGTDataValue[], category: DGTCategory) {
    this.logger.debug(DGTDataInterfaceEmailComponent.name, 'Update received', { values, category });
    this.paramChecker.checkParametersNotNull({values, category});

    const emailReferences = values.filter(value => value.predicate.name === 'hasEmail' && value.predicate.namespace === 'http://www.w3.org/2006/vcard/ns#');
    const emailValues = values.filter(value => value.predicate.name === 'value' && value.predicate.namespace === 'http://www.w3.org/2006/vcard/ns#');
    this.emailValues = emailValues;
    const emailTypes = values.filter(value => value.predicate.name === 'type' && value.predicate.namespace === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');

    this.logger.debug(DGTDataInterfaceEmailComponent.name, 'Filtered email values and references', { emailReferences, emailValues });

    if (emailReferences && emailValues && emailTypes) {
      const emailsReferencesWithValues = emailReferences.map<{ key: DGTDataValue; value: { email: string, type: string }; }>(emailReference => {
        const emailReferenceObject = emailReference.object.value;

        const emailValue = emailValues.find(val => val.subject.value === emailReferenceObject);
        const emailType = emailTypes.find(type => type.subject.value === emailReferenceObject);
        const value = emailValue && emailType ? { email: emailValue.object.value, type: emailType.object.value } : null;

        return {
          key: emailReference,
          value
        };
      });

      this.logger.debug(DGTDataInterfaceEmailComponent.name, 'Combined email references with values', { emailsReferencesWithValues });
      this.emails = new DGTMap<DGTDataValue, { email: string, type: string }>(emailsReferencesWithValues);
      this.logger.debug(DGTDataInterfaceEmailComponent.name, 'Filtered emails', { emails: this.emails });
    }
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(val: {value: DGTDataValue, newObject: any}): void {
    this.paramChecker.checkParametersNotNull({val});
    const oldValue = this.emailValues.find(value => value.subject.value === val.value.object.value);
    this.valueUpdated.emit({value: oldValue, newObject: val.newObject});
  }

  /**
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onSubmit(): void {
    this.submit.emit();
  }
}
