import { NgModule } from '@angular/core';
import { DGTLDService } from './linked-data/services/dgt-ld.service';
import { DGTSharedUtilsModule, DGTHttpAngularService, DGTHttpService } from '@digita/dgt-shared-utils';
import { DGTSourceGravatarConnector } from './gravatar/connectors/dgt-source-gravatar.connector';
import { DGTSourceMSSQLConnector } from './mssql/connectors/dgt-source-mssql.connector';
import { DGTSourceSolidConnector } from './solid/connectors/dgt-source-solid.connector';

export const declarations = [];
export const imports = [
  DGTSharedUtilsModule
];
export const providers = [
  DGTLDService,
  DGTSourceSolidConnector,
  DGTSourceMSSQLConnector,
  DGTSourceGravatarConnector
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: imports
})
export class DGTSharedConnectorsModule { }
