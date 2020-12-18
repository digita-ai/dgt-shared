import { NgModule, Type } from '@angular/core';
import { DGTConnectivityService } from './connectivity/services/dgt-connectivity.service';
import { DGTCryptoBrowserService } from './crypto/services/dgt-crypto-browser.service';
import { DGTErrorService } from './errors/services/dgt-error.service';
import { DGTHttpAngularService } from './http/services/dgt-http-angular.service';
import { DGTHttpService } from './http/services/dgt-http.service';
import { DGTLoggerService } from './logging/services/dgt-logger.service';
import { DGTOriginConfigService } from './origin/services/dgt-origin-config.service';
import { DGTOriginService } from './origin/services/dgt-origin.service';
import { DGTParameterCheckerService } from './parameters/services/parameter-checker.service';
import { DGTPlatformService } from './platform/services/dgt-platform.service';

export const declarations: (any[] | Type<any>)[] = [];
export const imports = [];
export const providers = [
  DGTLoggerService,
  DGTCryptoBrowserService,
  DGTConnectivityService,
  {
    provide: DGTHttpService,
    useClass: DGTHttpAngularService,
  },
  {
    provide: DGTOriginService,
    useClass: DGTOriginConfigService,
  },
  DGTErrorService,
  DGTPlatformService,
  DGTParameterCheckerService,
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: [
  ],
})
export class DGTSharedUtilsModule { }
