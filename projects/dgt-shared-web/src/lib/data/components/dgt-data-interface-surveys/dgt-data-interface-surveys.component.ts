import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { DGTLoggerService, DGTMap, DGTErrorArgument } from '@digita/dgt-shared-utils';
import { DGTCategory } from '@digita/dgt-shared-data';
import { DGTDataValue, DGTDataInterface } from '@digita/dgt-shared-data';

@Component({
  selector: 'dgt-data-interface-surveys',
  templateUrl: './dgt-data-interface-surveys.component.html',
  styleUrls: ['./dgt-data-interface-surveys.component.scss']
})
export class DGTDataInterfaceSurveysComponent implements OnInit, DGTDataInterface {

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

  public surveys: DGTMap<DGTDataValue, string>;

  /** Used to emit feedbackEvent events */
  @Output()
  valueUpdated: EventEmitter<{value: DGTDataValue, newObject: any}>;

  @Output()
  submit: EventEmitter<any>;

  constructor(private logger: DGTLoggerService) {
    this.valueUpdated = new EventEmitter();
    this.submit = new EventEmitter();
  }

  ngOnInit() {
  }

  private updateReceived(values: DGTDataValue[], category: DGTCategory) {
    this.logger.debug(DGTDataInterfaceSurveysComponent.name, 'Update received', { values, category });

    if (!values) {
      throw new DGTErrorArgument('Argument values should be set.', values);
    }

    if (!category) {
      throw new DGTErrorArgument('Argument category should be set.', category);
    }

    const surveyReferences = values.filter(value => value.predicate === 'http://digita.ai/voc/health#survey');

    surveyReferences.map(surveyReference => {

    });
    // const emailValues = values.filter(value => value.predicate === 'http://www.w3.org/2006/vcard/ns#value');
    // const emailTypes = values.filter(value => value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

    // this.logger.debug(DGTBrowserDataInterfaceEmailComponent.name, 'Filtered email values and references', { emailReferences, emailValues });

    // if (emailReferences && emailValues && emailTypes) {
    //   const emailsReferencesWithValues = emailReferences.map<{ key: DGTDataValue; value: { email: string, type: string }; }>(emailReference => {
    //     const emailReferenceObject = emailReference.object.value;

    //     const emailValue = emailValues.find(val => val.subject.value === emailReferenceObject);
    //     const emailType = emailTypes.find(type => type.subject.value === emailReferenceObject);
    //     const value = emailValue && emailType ? { email: emailValue.object.value, type: emailType.object.value } : null;

    //     return {
    //       key: emailReference,
    //       value
    //     };
    //   });

    //   this.logger.debug(DGTBrowserDataInterfaceEmailComponent.name, 'Combined email references with values', { emailsReferencesWithValues });

    //   this.emails = new DGTMap<DGTDataValue, { email: string, type: string }>(emailsReferencesWithValues);

    //   this.logger.debug(DGTBrowserDataInterfaceEmailComponent.name, 'Filtered emails', { emails: this.emails });
    // }
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(val: {value: DGTDataValue, newObject: any}): void {
    if (!val) {
      throw new DGTErrorArgument('Argument value should be set.', val);
    }
    this.valueUpdated.emit(val);
  }
}
