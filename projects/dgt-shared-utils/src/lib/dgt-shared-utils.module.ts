import { NgModule } from '@angular/core';
import { DGTLoggerService } from './logging/services/dgt-logger.service';
import { DGTErrorService } from './logging/services/dgt-error.service';
import { DGTPlatformService } from './platform/services/dgt-platform.service';
import { DGTConnectionService } from './connection/services/dgt-connection.service';
import { DGTHttpService } from './http/services/dgt-http.service';

@NgModule({
  declarations: [
  ],
  imports: [
  ],
  providers: [
    DGTConnectionService,
    DGTHttpService,
    DGTErrorService,
    DGTLoggerService,
    DGTPlatformService
  ],
  exports: [
  ]
})
export class DGTSharedUtilsModule { }
