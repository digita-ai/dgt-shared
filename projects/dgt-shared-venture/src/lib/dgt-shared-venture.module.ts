import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DGTSharedUtilsModule } from '@digita/dgt-shared-utils';
import { DGTSharedDataModule } from '@digita/dgt-shared-data';
import { DGTSharedWebModule } from '@digita/dgt-shared-web';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [],
  imports: [
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
    DGTSharedWebModule
  ],
  providers: [
  ],
  exports: [
  ]
})
export class DGTSharedVentureModule { }
