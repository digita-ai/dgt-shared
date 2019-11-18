import { NgModule } from '@angular/core';
import { DGTLDService } from './linked-data/services/dgt-ld.service';
import { DGTSharedUtilsModule } from '@digita/dgt-shared-utils';

export const declarations = [];
export const imports = [
  DGTSharedUtilsModule
];
export const providers = [
  DGTLDService
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: []
})
export class DgtSharedConnectorsModule { }
