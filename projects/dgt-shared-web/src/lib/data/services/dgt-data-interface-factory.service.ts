import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { DGTCategory, DGTDataInterfaceHostDirective, DGTLDResource } from '@digita-ai/dgt-shared-data';
import { DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTDataInterfaceResolverService } from './dgt-data-interface-resolver.service';

@DGTInjectable()
export class DGTDataInterfaceFactoryService {
  constructor(
    private resolver: DGTDataInterfaceResolverService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private paramChecker: DGTParameterCheckerService,
  ) { }

  public create(host: DGTDataInterfaceHostDirective, category: DGTCategory, resource: DGTLDResource) {
    this.paramChecker.checkParametersNotNull({viewcontainerref: host.viewContainerRef, category});
    // let viewContainerRef: ViewContainerRef = this.activitiesHost.viewContainerRef;

    host.viewContainerRef.clear();

    const type = this.resolver.getComponentType(category);

    if (type !== null) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(type);
      const componentRef = host.viewContainerRef.createComponent(componentFactory);
      componentRef.instance.category = category;
      componentRef.instance.resource = resource;
      componentRef.instance.valueUpdated.subscribe(event => host.onValueUpdated(event));
      componentRef.instance.submit.subscribe(() => host.onSubmit());
      componentRef.changeDetectorRef.detectChanges();
    }
  }
}
