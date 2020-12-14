import { NgModule } from '@angular/core';
import { DGTSharedUtilsModule } from '@digita-ai/dgt-shared-utils';
import { DGTSessionStorageService } from '@digita-ai/dgt-shared-data';
import { DGTSourceGravatarConnector } from './gravatar/connectors/dgt-source-gravatar.connector';
import { DGTSourceMSSQLConnector } from './mssql/connectors/dgt-source-mssql.connector';
import { DGTSourceSolidConnector } from './solid/connectors/dgt-source-solid.connector';
import { DGTSourceSolidTrustedAppTransformerService } from './solid/services/dgt-source-solid-trusted-app-transformer.service';

export const declarations = [];
export const imports = [
  DGTSharedUtilsModule,
];
export const providers = [
  DGTSourceSolidConnector,
  DGTSourceMSSQLConnector,
  DGTSourceGravatarConnector,
  DGTSourceSolidTrustedAppTransformerService,
  DGTSessionStorageService,
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: imports
})
export class DGTSharedConnectorsModule { }
