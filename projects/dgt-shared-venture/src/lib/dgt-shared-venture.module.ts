import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DGTSharedUtilsModule } from '@digita/dgt-shared-utils';
import { DGTSharedDataModule, DGTFileService } from '@digita/dgt-shared-data';
import { DGTSharedWebModule, DGTAuthService } from '@digita/dgt-shared-web';
import { DGTVentureFileService } from './file/services/dgt-venture-file.service';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { DGTFirebaseAuthService } from './security/services/dgt-firebase-auth.service';
import { AngularFireAuthModule } from 'angularfire2/auth';

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
    provide: DGTFileService,
    useClass: DGTVentureFileService
  },
  {
    provide: DGTAuthService,
    useClass: DGTFirebaseAuthService
  }
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: [
  ]
})
export class DGTSharedVentureModule { }
