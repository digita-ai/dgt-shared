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

  /** Data values that belong under this group */
  private _values: DGTLDResource[];
  public get values(): DGTLDResource[] {
    return this._values;
  }
  @Input() public set values(values: DGTLDResource[]) {
    this._values = values;
    this.updateReceived(values, this.categories);
  }

  /** Categories of this group */
  private _categories: DGTCategory[];
  public get categories(): DGTCategory[] {
    return this._categories;
  }
  @Input() public set categories(categories: DGTCategory[]) {
    this._categories = categories;
    this.updateReceived(this.values, categories);
  }

  /** Used to emit feedbackEvent events */
  @Output()
  public valueUpdated: EventEmitter<{ value: DGTLDResource, newObject: any }>;

  /** Used to emit infoClicked events */
  @Output()
  infoClicked: EventEmitter<DGTCategory>;

  /** Data values grouped by category uri */
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
   * This function will be called when values or categories get updated
   * It groups the categories and values by category uri
   * @param values values to group
   * @param categories categories to group
   */
  public updateReceived(values: DGTLDResource[], categories: DGTCategory[]) {
    this.logger.debug(DGTDataGroupComponent.name, 'Received update', { values, categories });

    if (values && categories) {
      // Categories for which a value exists
      if (this.categories.length > 0) {
        this.groupedCategories = _.groupBy(categories, category => category.uri);

        // grouping values by category
        this.categories.forEach(category => {
          if (category.uri) {
            this.datavalueService.getValuesOfCategories([category], values)
              .subscribe(valuesOfCategory => {
                this.groupedValues.set(
                  category.uri,
                  valuesOfCategory,
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
