import { Type } from '@angular/core';
import { DGTCategory, DGTDataInterface } from '@digita-ai/dgt-shared-data';
import { DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { DGTDataInterfaceStandardComponent } from '../components/dgt-data-interface-standard/dgt-data-interface-standard.component';
import { DGTDataInterfaceResolverService } from './dgt-data-interface-resolver.service';

@DGTInjectable()
export class DGTDataInterfaceResolverMockService extends DGTDataInterfaceResolverService {
    public getComponentType(category: DGTCategory): Type<DGTDataInterface> {
        return DGTDataInterfaceStandardComponent;
    }
}
