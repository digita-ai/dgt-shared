import { NgModule } from '@angular/core';
import { DGTLoggerService } from './logging/services/dgt-logger.service';
import { DGTErrorService } from './logging/services/dgt-error.service';

@NgModule({
  declarations: [
  ],
  imports: [
  ],
  providers: [
    DGTErrorService,
    DGTLoggerService
  ],
  exports: [
  ]
})
export class DgtSharedUtilsModule { }
