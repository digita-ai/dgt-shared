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

  /** Resources that belong under this group */
  private _resources: DGTLDResource[];
  public get resources(): DGTLDResource[] {
    return this._resources;
  }
  @Input() public set resources(resources: DGTLDResource[]) {
    this._resources = resources;
    this.updateReceived(resources, this.categories);
  }

  /** Categories of this group */
  private _categories: DGTCategory[];
  public get categories(): DGTCategory[] {
    return this._categories;
  }
  @Input() public set categories(categories: DGTCategory[]) {
    this._categories = categories;
    this.updateReceived(this.resources, categories);
  }

  /** Used to emit feedbackEvent events */
  @Output()
  public resourceUpdated: EventEmitter<{ resource: DGTLDResource, newObject: any }>;

  /** Used to emit infoClicked events */
  @Output()
  infoClicked: EventEmitter<DGTCategory>;

  /** resource grouped by category uri */
  public groupedResources;
  /** Categories grouped by category uri */
  public groupedCategories;

  constructor(
    private resourcesService: DGTLDResourceRemoteService,
    private paramChecker: DGTParameterCheckerService,
    private logger: DGTLoggerService,
  ) {
    this.groupedResources = new Map();
    this.resourceUpdated = new EventEmitter();
    this.infoClicked = new EventEmitter();
  }

  ngOnInit() { }

  /**
   * This function will be called when resources or categories get updated
   * It groups the categories and resources by category uri
   * @param resources resources to group
   * @param categories categories to group
   */
  public updateReceived(resources: DGTLDResource[], categories: DGTCategory[]) {
    this.logger.debug(DGTDataGroupComponent.name, 'Received update', { resources, categories });

    if (resources && categories) {
      // Categories for which a resource exists
      if (this.categories.length > 0) {
        this.groupedCategories = _.groupBy(categories, category => category.uri);

        // grouping resources by category
        this.categories.forEach(category => {
          if (category.uri) {
            this.resourcesService.getResourcesOfCategories([category], resources)
              .subscribe(resourcesOfCategory => {
                this.groupedResources.set(
                  category.uri,
                  resourcesOfCategory,
                );
              });
          }
        });
      }
    }
  }

  /**
   * @param resource resource to update
   * @throws DGTErrorArgument when resource is not set
   * @emits
  */
  public onResourceUpdated(val: { resource: DGTLDResource, newObject: any }): void {
    this.paramChecker.checkParametersNotNull({ val }, 1);
    this.resourceUpdated.emit(val);
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
