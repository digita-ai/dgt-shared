import { NgModule } from '@angular/core';
import { DGTMockDataService } from './metadata/services/dgt-mock-data.service';
import { DGTQueryService } from './metadata/services/dgt-query.service';
import { DGTSourceService } from './source/services/dgt-source.service';
import { DGTWorkflowService } from './workflow/services/dgt-workflow.service';
import { DGTSharedUtilsModule } from '@digita-ai/dgt-shared-utils';
import { DGTCacheService } from './cache/services/dgt-cache.service';
import { DGTLDFilterRunnerBGPService } from './linked-data/services/dgt-ld-filter-runner-bgp.service';
import { DGTLDFilterService } from './linked-data/services/dgt-ld-filter.service';
import { DGTLDFilterRunnerSparqlService } from './linked-data/services/dgt-ld-filter-runner-sparql.service';
import { DGTLDTripleFactoryService } from './linked-data/services/dgt-ld-triple-factory.service';
import { DGTDataInterfaceHostDirective } from './data-value/directives/data-interface-host.directive';
import { DGTConnectionsService } from './connection/services/dgt-connections.service';
import { DGTLDService } from './linked-data/services/dgt-ld.service';
import { DGTLDUtils } from './linked-data/services/dgt-ld-utils.service';
import { DGTLDTypeRegistrationTransformerService } from './linked-data/services/dgt-ld-type-registration-transformer.service';
import { DGTProfileTransformerService } from './profile/services/dgt-profile-transformer.service';
import { DGTEventTransformerService } from './events/services/dgt-event-transformer.service';
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
  DGTMockDataService,
  DGTCacheService,
  DGTWorkflowService,
  DGTLDTripleFactoryService,
  DGTConnectionsService,
  DGTLDTypeRegistrationTransformerService,
  DGTProfileTransformerService,
  DGTEventTransformerService,
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
