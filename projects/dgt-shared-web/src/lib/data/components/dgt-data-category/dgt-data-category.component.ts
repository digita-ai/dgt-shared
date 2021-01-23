import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DGTCategory, DGTDataInterfaceHostDirective, DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTLoggerService, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTDataInterfaceFactoryService } from '../../services/dgt-data-interface-factory.service';

@Component({
  selector: 'dgt-data-category',
  templateUrl: './dgt-data-category.component.html',
  styleUrls: ['./dgt-data-category.component.scss'],
})
export class DGTDataCategoryComponent implements AfterViewInit {

  /** Updates in children that need updating */
  public resourcesToUpdate: Map<string, { resource: DGTLDResource, newObject: any }>;

  @ViewChild(DGTDataInterfaceHostDirective) host: DGTDataInterfaceHostDirective;

  /** Data resources that belong under this group */
  private _resources: DGTLDResource[];
  public get resources(): DGTLDResource[] {
    return this._resources;
  }
  @Input() public set resources(resources: DGTLDResource[]) {
    this._resources = resources;
    this.updateReceived(resources, this.category);
  }

  /** Categories of this group */
  private _category: DGTCategory;
  public get category(): DGTCategory {
    return this._category;
  }
  @Input() public set category(category: DGTCategory) {
    this._category = category;
    this.updateReceived(this.resources, category);
  }

  /** Used to emit feedbackEvent events */
  @Output()
  resourceUpdated: EventEmitter<{ resource: DGTLDResource, newObject: any }>;

  /** Used to emit infoClicked events */
  @Output()
  infoClicked: EventEmitter<DGTCategory>;

  constructor(
    private interfaces: DGTDataInterfaceFactoryService,
    private paramChecker: DGTParameterCheckerService,
    private logger: DGTLoggerService,
  ) {
    this.resourceUpdated = new EventEmitter();
    this.infoClicked = new EventEmitter();
    this.resourcesToUpdate = new Map();
  }

  ngAfterViewInit(): void {
    if (this.host) {
      this.interfaces.create(this.host, this.category, this.resources);
    }
  }

  /**
   * @param resource resource to update
   * @throws DGTErrorArgument when resource is not set
   * @emits
  */
  public onResourceUpdated(val: { resource: DGTLDResource, newObject: any }): void {
    this.paramChecker.checkParametersNotNull({ val }, 1);
    this.resourcesToUpdate.set(val.resource.uri, val);
  }

  public updateResources(updates: Map<string, { resource: DGTLDResource, newObject: any }>): void {
    updates.forEach(update => this.resourceUpdated.emit(update));
    this.resourcesToUpdate.clear();
  }

  public clickedInfo(category: DGTCategory): void {
    this.logger.debug(DGTDataCategoryComponent.name, 'Clicked info in category component, emitting');
    this.infoClicked.emit(category);
  }

  updateReceived(resources: DGTLDResource[], categories: DGTCategory): any {
    if (resources && categories) {
      this.ngAfterViewInit();
    }
  }
}
