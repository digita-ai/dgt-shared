import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DGTCategory, DGTDataGroup, DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTLDResourceRemoteService } from '../../../resources/services/dgt-ld-resource-remote.service';

@Component({
  selector: 'dgt-data-group',
  templateUrl: './dgt-data-group.component.html',
  styleUrls: ['./dgt-data-group.component.scss'],
})
/** This component acts as a container for categories that belong together */
export class DGTDataGroupComponent implements OnInit {

  /** Group of this component */
  @Input() public group: DGTDataGroup;

  /** Data resource that belong under this group */
  private _resource: DGTLDResource;
  public get resource(): DGTLDResource {
    return this._resource;
  }
  @Input() public set resource(resource: DGTLDResource) {
    this._resource = resource;
    this.updateReceived(resource, this.categories);
  }

  /** Categories of this group */
  private _categories: DGTCategory[];
  public get categories(): DGTCategory[] {
    return this._categories;
  }
  @Input() public set categories(categories: DGTCategory[]) {
    this._categories = categories;
    this.updateReceived(this.resource, categories);
  }

  /** Used to emit feedbackEvent events */
  @Output()
  public valueUpdated: EventEmitter<{ value: DGTLDResource, newObject: any }>;

  /** Used to emit infoClicked events */
  @Output()
  infoClicked: EventEmitter<DGTCategory>;

  /** Data resource grouped by category uri */
  public groupedValues;
  /** Categories grouped by category uri */
  public groupedCategories;

  constructor(
    private datavalueService: DGTLDResourceRemoteService,
    private paramChecker: DGTParameterCheckerService,
    private logger: DGTLoggerService,
  ) {
    this.groupedValues = new Map();
    this.valueUpdated = new EventEmitter();
    this.infoClicked = new EventEmitter();
  }

  ngOnInit() { }

  /**
   * This function will be called when resource or categories get updated
   * It groups the categories and resource by category uri
   * @param resource resource to group
   * @param categories categories to group
   */
  public updateReceived(resource: DGTLDResource, categories: DGTCategory[]) {
    this.logger.debug(DGTDataGroupComponent.name, 'Received update', { resource, categories });

    if (resource && categories) {
      // Categories for which a value exists
      if (this.categories.length > 0) {
        this.groupedCategories = _.groupBy(categories, category => category.uri);

        // grouping resource by category
        this.categories.forEach(category => {
          if (category.uri) {
            this.datavalueService.getValuesOfCategories([category], [resource])
              .subscribe(resourceOfCategory => {
                this.groupedValues.set(
                  category.uri,
                  resourceOfCategory,
                );
              });
          }
        });
      }
    }
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
  */
  public onValueUpdated(val: { value: DGTLDResource, newObject: any }): void {
    this.paramChecker.checkParametersNotNull({ val }, 1);
    this.valueUpdated.emit(val);
  }

  /**
   * @param category Category on which info has been clicked
   * @throws DGTErrorArgument when category is not set
   * @emits
  */
  public onInfoClicked(category: DGTCategory): void {
    this.logger.debug(DGTDataGroupComponent.name, 'Clicked info in category component, emitting');
    this.paramChecker.checkParametersNotNull({ category }, 1);
    this.infoClicked.emit(category);
  }
}
