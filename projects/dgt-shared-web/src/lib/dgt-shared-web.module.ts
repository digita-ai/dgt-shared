import { NgModule } from '@angular/core';
import { DGTTitleService } from './interface/services/dgt-title.service';
import { DGTEmailUniqueValidator } from './validation/validators/dgt-email-unique.validator';
import { DGTPhoneValidator } from './validation/validators/dgt-phone.validator';
import { DGTCompareValidator } from './validation/validators/dgt-compare.validator';
import { DGTI8NService } from './i8n/services/dgt-i8n.service';
import { DGTSharedUtilsModule } from '@digita/dgt-shared-utils';
import { DGTNGRXStoreService } from './state/services/dgt-ngrx-store.service';
import { DGTStoreService } from './state/services/dgt-store.service';
import { DGTSharedDataModule } from '@digita/dgt-shared-data';

export const declarations = [];
export const imports = [
  DGTSharedUtilsModule,
  DGTSharedDataModule
];
export const providers = [
  DGTTitleService,
  DGTEmailUniqueValidator,
  DGTI8NService,
  DGTPhoneValidator,
  DGTCompareValidator,
  {
    provide: DGTStoreService,
    useClass: DGTNGRXStoreService
  }
];

@NgModule({
  declarations,
  providers,
  imports,
  exports: [

  ]
})
export class DGTSharedWebModule { }
