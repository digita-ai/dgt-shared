import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DGTCategory, DGTDataInterface, DGTLDResource, DGTLDTriple } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTMap, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';

@Component({
  selector: 'dgt-data-interface-phone',
  templateUrl: './dgt-data-interface-phone.component.html',
  styleUrls: ['./dgt-data-interface-phone.component.scss'],
})
export class DGTDataInterfacePhoneComponent implements OnInit, DGTDataInterface {

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

  /** all DGTLDResources of which we want to display the phone */
  private _values: DGTLDResource[];
  public get values(): DGTLDResource[] {
    return this._values;
  }
  @Input() public set values(values: DGTLDResource[]) {
    this._values = values;

    if (this.values && this.category) {
      this.updateReceived(this.values, this.category);
    }
  }

  public phoneNumbers: DGTMap<DGTLDTriple, { phone: string, type: string }>;

  private phoneValues: DGTLDTriple[];

  /** Used to emit feedbackEvent events */
  @Output()
  valueUpdated: EventEmitter<{ value: DGTLDResource, newObject: any }>;

  /** Used to emit submit events */
  @Output()
  submit: EventEmitter<any>;

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
  ) {
    this.valueUpdated = new EventEmitter();
    this.submit = new EventEmitter();
  }

  ngOnInit() { }

  private updateReceived(values: DGTLDResource[], category: DGTCategory) {
    this.logger.debug(DGTDataInterfacePhoneComponent.name, 'Update received', { values, category });
    this.paramChecker.checkParametersNotNull({ values, category });

    const triples = _.flatten(values.map(resource => resource.triples));

    const phoneReferences = triples.filter(value => value.predicate === 'http://www.w3.org/2006/vcard/ns#hasTelephone');
    const phoneValues = triples.filter(value => value.predicate === 'http://www.w3.org/2006/vcard/ns#value');
    this.phoneValues = phoneValues;
    const phoneTypes = triples.filter(value => value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    this.logger.debug(DGTDataInterfacePhoneComponent.name, 'Filtered hasTelephone values and references', { phoneReferences, phoneValues });

    if (phoneReferences && phoneValues && phoneTypes) {
      const phoneReferencesWithValues = phoneReferences.map<{ key: DGTLDTriple; value: { phone: string, type: string }; }>(phoneReference => {
        const phoneReferenceObject = phoneReference.object.value;

        const phoneValue = phoneValues.find(val => val.subject.value === phoneReferenceObject);
        const phoneType = phoneTypes.find(type => type.subject.value === phoneReferenceObject);
        const value = phoneValue && phoneType ? { phone: phoneValue.object.value, type: phoneType.object.value } : null;

        return {
          key: phoneReference,
          value,
        };
      });

      this.logger.debug(DGTDataInterfacePhoneComponent.name, 'Combined phone references with values', { phoneReferencesWithValues });
      this.phoneNumbers = new DGTMap<DGTLDTriple, { phone: string, type: string }>(phoneReferencesWithValues);
      this.logger.debug(DGTDataInterfacePhoneComponent.name, 'Filtered phone number', { phoneNumbers: this.phoneNumbers });
    }
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(val: { value: DGTLDResource, newObject: any }): void {
    this.paramChecker.checkParametersNotNull({ val });
    const oldValue = this.phoneValues.find(value => value.subject.value === val.value.triples[0].object.value);
    this.valueUpdated.emit({ value: { triples: [oldValue] } as DGTLDResource, newObject: val.newObject });
  }

  /**
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onSubmit(): void {
    this.submit.emit();
  }
}
