import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DGTCategory, DGTDataInterface, DGTLDResource, DGTLDTriple } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTMap, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';

@Component({
  selector: 'dgt-data-interface-email',
  templateUrl: './dgt-data-interface-email.component.html',
  styleUrls: ['./dgt-data-interface-email.component.scss'],
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

  /** all DGTLDResources of which we want to display the email */
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

  public emails: DGTMap<DGTLDTriple, { email: string, type: string }>;

  private emailValues: DGTLDTriple[];

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
    this.logger.debug(DGTDataInterfaceEmailComponent.name, 'Update received', { values, category });
    this.paramChecker.checkParametersNotNull({ values, category });

    const triples = _.flatten(values.map(resource => resource.triples))

    const emailReferences = triples.filter(value => value.predicate === 'http://www.w3.org/2006/vcard/ns#hasEmail');
    const emailValues = triples.filter(value => value.predicate === 'http://www.w3.org/2006/vcard/ns#value');
    this.emailValues = emailValues;
    const emailTypes = triples.filter(value => value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

    this.logger.debug(DGTDataInterfaceEmailComponent.name, 'Filtered email values and references', { emailReferences, emailValues });

    if (emailReferences && emailValues && emailTypes) {
      const emailsReferencesWithValues = emailReferences.map<{ key: DGTLDTriple; value: { email: string, type: string }; }>(emailReference => {
        const emailReferenceObject = emailReference.object.value;

        const emailValue = emailValues.find(val => val.subject.value === emailReferenceObject);
        const emailType = emailTypes.find(type => type.subject.value === emailReferenceObject);
        const value = emailValue && emailType ? { email: emailValue.object.value, type: emailType.object.value } : null;

        return {
          key: emailReference,
          value,
        };
      });

      this.logger.debug(DGTDataInterfaceEmailComponent.name, 'Combined email references with values', { emailsReferencesWithValues });
      this.emails = new DGTMap<DGTLDTriple, { email: string, type: string }>(emailsReferencesWithValues);
      this.logger.debug(DGTDataInterfaceEmailComponent.name, 'Filtered emails', { emails: this.emails });
    }
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(val: { value: DGTLDResource, newObject: any }): void {
    this.paramChecker.checkParametersNotNull({ val });
    const oldValue = this.emailValues.find(value => value.subject.value === val.value.triples[0].object.value);
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
