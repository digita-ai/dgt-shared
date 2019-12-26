import { NgModule, Type } from '@angular/core';
import { DGTLoggerService } from './logging/services/dgt-logger.service';
import { DGTErrorService } from './logging/services/dgt-error.service';
import { DGTPlatformService } from './platform/services/dgt-platform.service';
import { DGTConnectionService } from './connection/services/dgt-connection.service';
import { DGTHttpService } from './http/services/dgt-http.service';

export const declarations: (any[] | Type<any>)[] = [];
export const imports = [];
export const providers = [
  DGTConnectionService,
  DGTHttpService,
  DGTErrorService,
  DGTLoggerService,
  DGTPlatformService,
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: [
  ]
})
export class DGTSharedUtilsModule { }
