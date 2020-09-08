import { Injectable, Type } from '@angular/core';
import { DGTCategory, DGTDataInterface } from '@digita/dgt-shared-data';

@Injectable()
export abstract class DGTDataInterfaceResolverService {
    public abstract getComponentType(category: DGTCategory): Type<DGTDataInterface>
}