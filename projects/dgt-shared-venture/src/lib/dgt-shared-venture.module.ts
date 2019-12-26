import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DGTSharedUtilsModule } from '@digita/dgt-shared-utils';
import { DGTSharedDataModule, DGTDataService, DGTLogicService } from '@digita/dgt-shared-data';
import { DGTSharedWebModule } from '@digita/dgt-shared-web';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { DGTFirebaseAuthService } from './security/services/dgt-firebase-auth.service';
import { DGTVentureFileService } from './file/services/dgt-venture-file.service';
import { DGTClientDataService } from './integrations/services/dgt-client-data.service';
import { DGTClientLogicService } from './integrations/services/dgt-client-logic.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const declarations = [];
export const imports = [
  CommonModule,
  TranslateModule.forChild({
    loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
    }
  }),
  DGTSharedUtilsModule,
  DGTSharedDataModule,
  DGTSharedWebModule,
  AngularFireAuthModule,
  AngularFireStorageModule
];
export const providers = [
  {
    provide: DGTDataService,
    useClass: DGTClientDataService
  },
  {
    provide: DGTLogicService,
    useClass: DGTClientLogicService
  },
  DGTVentureFileService,
  DGTFirebaseAuthService,
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: [
  ]
})
export class DGTSharedVentureModule { }
