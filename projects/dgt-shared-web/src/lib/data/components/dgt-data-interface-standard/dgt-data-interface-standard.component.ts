import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DGTCategory, DGTDataInterface, DGTLDFilterService, DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTLDFilterBGP } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';

@Component({
  selector: 'dgt-data-interface-standard',
  templateUrl: './dgt-data-interface-standard.component.html',
  styleUrls: ['./dgt-data-interface-standard.component.scss'],
})
/**
 * The default way of displaying data. This component used the data-field component
 * to display itd resource.
 */
export class DGTDataInterfaceStandardComponent implements OnInit, DGTDataInterface {

  /** Holds the category this interface belongs to */
  private _category: DGTCategory;
  public get category(): DGTCategory {
    return this._category;
  }
  @Input() public set category(category: DGTCategory) {
    this._category = category;

    this.updateReceived(this.resource, category);
  }

  /** holds the resource to display */
  private _resource: DGTLDResource;
  public get resource(): DGTLDResource {
    return this._resource;
  }
  @Input() public set resource(resource: DGTLDResource) {
    this._resource = resource;

    this.updateReceived(resource, this.category);
  }

  /** List of category fields for which a value exists */
  public filteredFields: DGTLDResource[];

  /** Used to emit feedbackEvent events */
  @Output()
  public valueUpdated: EventEmitter<{ value: DGTLDResource, newObject: any }>;
  /** Used to emit submit events */
  @Output()
  public submit: EventEmitter<any>;

  constructor(
    private paramChecker: DGTParameterCheckerService,
    private logger: DGTLoggerService,
    private filterService: DGTLDFilterService,
  ) {
    this.valueUpdated = new EventEmitter();
    this.submit = new EventEmitter();
  }

  ngOnInit() { }

  private updateReceived(resource: DGTLDResource, category: DGTCategory) {
    this.logger.debug(DGTDataInterfaceStandardComponent.name, 'Update received', { resource, category });

    if (resource && category) {
      this.filterService.run(category.filter, [resource]).subscribe(
        (vals: DGTLDResource[]) => this.filteredFields = vals,
      );
      /* const filteredPredicates = _.flatten(category.filters
        .map((filter: DGTLDFilterBGP) => filter.predicates)
      );

      this.filteredFields = resource
        .filter((value: DGTLDResource) =>
          filteredPredicates.some(predicate => predicate === value.predicate)
        ); */
    }
  }

  /**
   * @param val the original value and its updated object value
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onValueUpdated(val: { value: DGTLDResource, newObject: any }): void {
    this.paramChecker.checkParametersNotNull({ val }, 1);
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
