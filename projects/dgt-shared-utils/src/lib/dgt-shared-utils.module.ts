import { NgModule, Type } from '@angular/core';
import { DGTLoggerService } from './logging/services/dgt-logger.service';
import { DGTErrorService } from './errors/services/dgt-error.service';
import { DGTPlatformService } from './platform/services/dgt-platform.service';
import { DGTConnectionService } from './connection/services/dgt-connection.service';
import { DGTHttpService } from './http/services/dgt-http.service';
import { DGTHttpAngularService } from './http/services/dgt-http-angular.service';
import { DGTDateToLabelService } from './date/services/dgt-date-to-label.service';
import { DGTCryptoBrowserService } from './crypto/services/dgt-crypto-browser.service';

export const declarations: (any[] | Type<any>)[] = [];
export const imports = [];
export const providers = [
  DGTLoggerService,
  DGTCryptoBrowserService,
  DGTConnectionService,
  {
    provide: DGTHttpService,
    useClass: DGTHttpAngularService
  },
  DGTErrorService,
  DGTPlatformService,
  DGTDateToLabelService
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: [
  ]
})
export class DGTSharedUtilsModule { }
