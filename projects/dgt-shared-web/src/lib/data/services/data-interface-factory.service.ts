import { Injectable, ComponentFactoryResolver, Type, } from '@angular/core';
import { DGTCategory, DGTDataValue, DGTDataInterface } from '@digita/dgt-shared-data';
import { DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTDataInterfaceEmailComponent } from '../components/dgt-data-interface-email/dgt-data-interface-email.component';
import { DGTDataInterfaceDescentComponent } from '../components/dgt-data-interface-descent/dgt-data-interface-descent.component';
import { DGTDataInterfaceSurveysComponent } from '../components/dgt-data-interface-surveys/dgt-data-interface-surveys.component';
import { DGTDataInterfacePhoneComponent } from '../components/dgt-data-interface-phone/dgt-data-interface-phone.component';
import { DGTDataInterfaceStandardComponent } from '../components/dgt-data-interface-standard/dgt-data-interface-standard.component';
import { DGTDataInterfaceHostDirective } from '@digita/dgt-shared-data';

@Injectable()
export class DGTDataInterfaceFactoryService {
  constructor(
    public componentFactoryResolver: ComponentFactoryResolver,
    private paramChecker: DGTParameterCheckerService,
  ) { }

  public create(host: DGTDataInterfaceHostDirective, category: DGTCategory, values: DGTDataValue[]) {
    this.paramChecker.checkParametersNotNull({viewcontainerref: host.viewContainerRef, category});
    // let viewContainerRef: ViewContainerRef = this.activitiesHost.viewContainerRef;

    host.viewContainerRef.clear();

    const type = this.getComponentType(category);

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

  private getComponentType(category: DGTCategory): Type<DGTDataInterface> {
    this.paramChecker.checkParametersNotNull({ category });

    let res: Type<DGTDataInterface> = null;

    if (category.id === 'email') {
      res = DGTDataInterfaceEmailComponent;
    } else if (category.id === 'descent') {
      res = DGTDataInterfaceDescentComponent;
    } else if (category.id === 'surveys') {
      res = DGTDataInterfaceSurveysComponent;
    } else if (category.id === 'phone') {
      res = DGTDataInterfacePhoneComponent;
    }

    if (!res) {
      res = DGTDataInterfaceStandardComponent;
    }

    return res;
  }
}
