import { Injectable, Type } from '@angular/core';
import { DGTCategory, DGTDataInterface } from '@digita/dgt-shared-data';
import { DGTInjectable } from '@digita/dgt-shared-utils';

@DGTInjectable()
export abstract class DGTDataInterfaceResolverService {
    public abstract getComponentType(category: DGTCategory): Type<DGTDataInterface>
}