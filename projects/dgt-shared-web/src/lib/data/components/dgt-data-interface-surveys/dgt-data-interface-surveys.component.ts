import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DGTCategory, DGTDataInterface, DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTErrorArgument, DGTLoggerService, DGTMap } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';

@Component({
  selector: 'dgt-data-interface-surveys',
  templateUrl: './dgt-data-interface-surveys.component.html',
  styleUrls: ['./dgt-data-interface-surveys.component.scss'],
})
export class DGTDataInterfaceSurveysComponent implements OnInit, DGTDataInterface {

  private _category: DGTCategory;
  public get category(): DGTCategory {
    return this._category;
  }
  @Input() public set category(category: DGTCategory) {
    this._category = category;

    if (this.resources && this.category) {
      this.updateReceived(this.resources, this.category);
    }
  }

  private _resources: DGTLDResource[];
  public get resources(): DGTLDResource[] {
    return this._resources;
  }
  @Input() public set resources(resources: DGTLDResource[]) {
    this._resources = resources;

    if (this.resources && this.category) {
      this.updateReceived(this.resources, this.category);
    }
  }

  public surveys: DGTMap<DGTLDResource[], string>;

  /** Used to emit feedbackEvent events */
  @Output()
  resourceUpdated: EventEmitter<{ resource: DGTLDResource, newObject: any }>;

  @Output()
  submit: EventEmitter<any>;

  constructor(private logger: DGTLoggerService) {
    this.resourceUpdated = new EventEmitter();
    this.submit = new EventEmitter();
  }

  ngOnInit() {
  }

  private updateReceived(resources: DGTLDResource[], category: DGTCategory) {
    this.logger.debug(DGTDataInterfaceSurveysComponent.name, 'Update received', { resources, category });

    if (!resources) {
      throw new DGTErrorArgument('Argument resources should be set.', resources);
    }

    if (!category) {
      throw new DGTErrorArgument('Argument category should be set.', category);
    }

    const surveyReferences = _.flatten(resources.map(resource => resource.triples)).filter(triple => triple.predicate === 'http://digita.ai/voc/health#survey');

    surveyReferences.map(surveyReference => {

    });
    // const emailValues = values.filter(value => value.predicate === 'http://www.w3.org/2006/vcard/ns#value');
    // const emailTypes = values.filter(value => value.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

    // this.logger.debug(DGTBrowserDataInterfaceEmailComponent.name, 'Filtered email values and references', { emailReferences, emailValues });

    // if (emailReferences && emailValues && emailTypes) {
    //   const emailsReferencesWithValues = emailReferences.map<{ key: DGTLDResource[]; value: { email: string, type: string }; }>(emailReference => {
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

    //   this.emails = new DGTMap<DGTLDResource[], { email: string, type: string }>(emailsReferencesWithValues);

    //   this.logger.debug(DGTBrowserDataInterfaceEmailComponent.name, 'Filtered emails', { emails: this.emails });
    // }
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onResourceUpdated(val: { resource: DGTLDResource, newObject: any }): void {
    if (!val) {
      throw new DGTErrorArgument('Argument value should be set.', val);
    }
    this.resourceUpdated.emit(val);
  }
}
