import { NgModule } from '@angular/core';
import { DGTQueryService } from './metadata/services/dgt-query.service';
import { DGTWorkflowService } from './workflow/services/dgt-workflow.service';
import { DGTSharedUtilsModule } from '@digita-ai/dgt-shared-utils';
import { DGTCacheService } from './cache/services/dgt-cache.service';
import { DGTLDFilterRunnerBGPService } from './linked-data/services/dgt-ld-filter-runner-bgp.service';
import { DGTLDFilterService } from './linked-data/services/dgt-ld-filter.service';
import { DGTLDFilterRunnerSparqlService } from './linked-data/services/dgt-ld-filter-runner-sparql.service';
import { DGTLDTripleFactoryService } from './linked-data/services/dgt-ld-triple-factory.service';
import { DGTDataInterfaceHostDirective } from './data-value/directives/data-interface-host.directive';
import { DGTLDService } from './linked-data/services/dgt-ld.service';
import { DGTLDUtils } from './linked-data/services/dgt-ld-utils.service';
import { DGTLDTypeRegistrationTransformerService } from './linked-data/services/dgt-ld-type-registration-transformer.service';
import { DGTProfileTransformerService } from './profile/services/dgt-profile-transformer.service';
import { DGTEventTransformerService } from './events/services/dgt-event-transformer.service';
import { DGTConnectorService } from './connector/services/dgt-connector.service';
import { DGTDataValueTransformerService } from './data-value/services/data-transformer-value.service';

import { DGTCacheInMemoryService } from './cache/services/dgt-cache-in-memory.service';
import { DGTCacheSolidService } from './cache/services/dgt-cache-solid.service';
import { DGTSparqlQueryService } from './sparql/services/dgt-sparql-query.service';
import { DGTConnectionTransformerService } from './connection/services/dgt-connection-transformer.service';
import { DGTExchangeTransformerService } from './exchanges/services/dgt-exchange-transformer.service';
import { DGTHolderTransformerService } from './holder/services/dgt-holder-transformer.service';
import { DGTInviteTransformerService } from './invite/services/dgt-invite-transformer.service';
import { DGTPurposeTransformerService } from './purpose/services/dgt-purpose-transformer.service';
import { DGTSourceTransformerService } from './source/services/dgt-source-transformer.service';

export const declarations = [
  DGTDataInterfaceHostDirective
];
export const imports = [
  DGTSharedUtilsModule
];
export const providers = [
  DGTLDUtils,
  DGTLDService,
  DGTLDFilterService,
  DGTLDFilterRunnerBGPService,
  DGTLDFilterRunnerSparqlService,
  DGTQueryService,
  DGTCacheInMemoryService,
  DGTCacheSolidService,
  DGTWorkflowService,
  DGTLDTripleFactoryService,
  DGTLDTypeRegistrationTransformerService,
  DGTDataValueTransformerService,
  DGTProfileTransformerService,
  DGTEventTransformerService,
  DGTConnectorService,
  DGTSparqlQueryService,
  DGTConnectionTransformerService,
  DGTExchangeTransformerService,
  DGTHolderTransformerService,
  DGTInviteTransformerService,
  DGTPurposeTransformerService,
  DGTSourceTransformerService,
];

@NgModule({
  declarations,
  providers,
  imports,
  exports: [
    DGTDataInterfaceHostDirective
  ]
})
export class DGTSharedDataModule { }
