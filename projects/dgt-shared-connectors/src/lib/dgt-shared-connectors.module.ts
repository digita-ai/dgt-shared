import { NgModule } from '@angular/core';
import { DGTSharedUtilsModule } from '@digita/dgt-shared-utils';
import { DGTSourceGravatarConnector } from './gravatar/connectors/dgt-source-gravatar.connector';
import { DGTSourceMSSQLConnector } from './mssql/connectors/dgt-source-mssql.connector';
import { DGTSourceSolidConnector } from './solid/connectors/dgt-source-solid.connector';
import { DGTSourceSolidValidator } from './solid/validators/dgt-source-solid.validator';

export const declarations = [];
export const imports = [
  DGTSharedUtilsModule
];
export const providers = [
  DGTSourceSolidConnector,
  DGTSourceMSSQLConnector,
  DGTSourceGravatarConnector,
  DGTSourceSolidValidator,
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: imports
})
export class DGTSharedConnectorsModule { }
