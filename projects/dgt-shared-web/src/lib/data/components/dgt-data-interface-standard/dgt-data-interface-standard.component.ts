import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DGTCategory, DGTDataInterface, DGTLDFilterService, DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';

@Component({
  selector: 'dgt-data-interface-standard',
  templateUrl: './dgt-data-interface-standard.component.html',
  styleUrls: ['./dgt-data-interface-standard.component.scss'],
})
/**
 * The default way of displaying data. This component used the data-field component
 * to display itd values.
 */
export class DGTDataInterfaceStandardComponent implements OnInit, DGTDataInterface {

  /** Holds the category this interface belongs to */
  private _category: DGTCategory;
  public get category(): DGTCategory {
    return this._category;
  }
  @Input() public set category(category: DGTCategory) {
    this._category = category;

    this.updateReceived(this.resources, category);
  }

  /** holds the values to display */
  private _resources: DGTLDResource[];
  public get resources(): DGTLDResource[] {
    return this._resources;
  }
  @Input() public set resources(resources: DGTLDResource[]) {
    this._resources = resources;

    this.updateReceived(resources, this.category);
  }

  /** List of category fields for which a value exists */
  public filteredResources: DGTLDResource[];

  /** Used to emit feedbackEvent events */
  @Output()
  public resourceUpdated: EventEmitter<{ resource: DGTLDResource, newObject: any }>;
  /** Used to emit submit events */
  @Output()
  public submit: EventEmitter<any>;

  constructor(
    private paramChecker: DGTParameterCheckerService,
    private logger: DGTLoggerService,
    private filterService: DGTLDFilterService,
  ) {
    this.resourceUpdated = new EventEmitter();
    this.submit = new EventEmitter();
  }

  ngOnInit() { }

  private updateReceived(resources: DGTLDResource[], category: DGTCategory) {
    this.logger.debug(DGTDataInterfaceStandardComponent.name, 'Update received', { resources, category });

    if (resources && category) {
      this.filterService.run(category.filter, resources).subscribe(
        (vals: DGTLDResource[]) => this.filteredResources = vals,
      );
      /* const filteredPredicates = _.flatten(category.filters
        .map((filter: DGTLDFilterBGP) => filter.predicates)
      );

      this.filteredResources = values
        .filter((resource: DGTLDResource[]) =>
          filteredPredicates.some(predicate => predicate === value.predicate)
        ); */
    }
  }

  /**
   * @param val the original value and its updated object value
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onResourceUpdated(val: { resource: DGTLDResource, newObject: any }): void {
    this.paramChecker.checkParametersNotNull({ val }, 1);
    this.resourceUpdated.emit(val);
  }

  /**
   * @throws DGTErrorArgument when value is not set
   * @emits
   */
  public onSubmit(): void {
    this.submit.emit();
  }
}
