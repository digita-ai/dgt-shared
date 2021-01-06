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
  public resourceToUpdate: Map<string, { value: DGTLDResource, newObject: any }>;

  @ViewChild(DGTDataInterfaceHostDirective) host: DGTDataInterfaceHostDirective;

  /** Data resource that belong under this group */
  private _resource: DGTLDResource;
  public get resource(): DGTLDResource {
    return this._resource;
  }
  @Input() public set resource(resource: DGTLDResource) {
    this._resource = resource;
    this.updateReceived(resource, this.category);
  }

  /** Categories of this group */
  private _category: DGTCategory;
  public get category(): DGTCategory {
    return this._category;
  }
  @Input() public set category(category: DGTCategory) {
    this._category = category;
    this.updateReceived(this.resource, category);
  }

  /** Used to emit feedbackEvent events */
  @Output()
  valueUpdated: EventEmitter<{ value: DGTLDResource, newObject: any }>;

  /** Used to emit infoClicked events */
  @Output()
  infoClicked: EventEmitter<DGTCategory>;

  constructor(
    private interfaces: DGTDataInterfaceFactoryService,
    private paramChecker: DGTParameterCheckerService,
    private logger: DGTLoggerService,
  ) {
    this.valueUpdated = new EventEmitter();
    this.infoClicked = new EventEmitter();
    this.resourceToUpdate = new Map();
  }

  ngAfterViewInit(): void {
    if (this.host) {
      this.interfaces.create(this.host, this.category, this.resource);
    }
  }

  /**
   * @param value Value to update
   * @throws DGTErrorArgument when value is not set
   * @emits
  */
  public onValueUpdated(val: { value: DGTLDResource, newObject: any }): void {
    this.paramChecker.checkParametersNotNull({ val }, 1);
    this.resourceToUpdate.set(val.value.uri, val);
  }

  public updateValues(resource: Map<string, { value: DGTLDResource, newObject: any }>): void {
    resource.forEach(value => this.valueUpdated.emit(value));
    this.resourceToUpdate.clear();
  }

  public clickedInfo(category: DGTCategory): void {
    this.logger.debug(DGTDataCategoryComponent.name, 'Clicked info in category component, emitting');
    this.infoClicked.emit(category);
  }

  updateReceived(resource: DGTLDResource, categories: DGTCategory): any {
    if (resource && categories) {
      this.ngAfterViewInit();
    }
  }
}
