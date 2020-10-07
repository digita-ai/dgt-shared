import { Injectable, ComponentFactoryResolver, } from '@angular/core';
import { DGTCategory, DGTDataValue } from '@digita-ai/dgt-shared-data';
import { DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTDataInterfaceHostDirective } from '@digita-ai/dgt-shared-data';
import { DGTDataInterfaceResolverService } from './dgt-data-interface-resolver.service';

@Injectable()
export class DGTDataInterfaceFactoryService {
  constructor(
    private resolver: DGTDataInterfaceResolverService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private paramChecker: DGTParameterCheckerService,
  ) { }

  public create(host: DGTDataInterfaceHostDirective, category: DGTCategory, values: DGTDataValue[]) {
    this.paramChecker.checkParametersNotNull({viewcontainerref: host.viewContainerRef, category});
    // let viewContainerRef: ViewContainerRef = this.activitiesHost.viewContainerRef;

    host.viewContainerRef.clear();

    const type = this.resolver.getComponentType(category);

    if (type !== null) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(type);
      const componentRef = host.viewContainerRef.createComponent(componentFactory);
      componentRef.instance.category = category;
      componentRef.instance.values = values;
      componentRef.instance.valueUpdated.subscribe(event => host.onValueUpdated(event));
      componentRef.instance.submit.subscribe(() => host.onSubmit());
      componentRef.changeDetectorRef.detectChanges();
    }
  }
}
