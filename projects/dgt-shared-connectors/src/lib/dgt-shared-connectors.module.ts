import { NgModule } from '@angular/core';
import { DGTLDService } from './linked-data/services/dgt-ld.service';

export const declarations = [];
export const imports = [];
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
