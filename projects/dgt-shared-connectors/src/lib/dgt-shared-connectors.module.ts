import { NgModule } from '@angular/core';
import { DGTSharedDataModule } from '@digita-ai/dgt-shared-data';
import { DGTSharedUtilsModule } from '@digita-ai/dgt-shared-utils';
import { DGTSessionStorageService } from '@digita-ai/dgt-shared-data';
import { DGTConnectorGravatar } from './gravatar/connectors/dgt-source-gravatar.connector';
import { DGTConnectorMSSQL } from './mssql/connectors/dgt-source-mssql.connector';
import { DGTConnectorSolid } from './solid/connectors/dgt-source-solid.connector';
import { DGTSolidService } from './solid/services/dgt-solid.service';
import { DGTSourceSolidTrustedAppTransformerService } from './solid/services/dgt-source-solid-trusted-app-transformer.service';
import { DGTConnectorSolidWeb } from './solid/connectors/dgt-source-solid-web.connector';
import { DGTOIDCService } from './oidc/services/dgt-oidc.service';

export const declarations = [];
export const imports = [
  DGTSharedUtilsModule,
  DGTSharedDataModule,
];
export const providers = [
  DGTConnectorSolid,
  DGTConnectorMSSQL,
  DGTConnectorGravatar,
  DGTSourceSolidTrustedAppTransformerService,
  DGTSessionStorageService,
  DGTConnectorSolidWeb,
  DGTSolidService,
  DGTOIDCService,
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: imports,
})
export class DGTSharedConnectorsModule { }
