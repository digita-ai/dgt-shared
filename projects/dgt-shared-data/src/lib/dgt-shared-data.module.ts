import { NgModule } from '@angular/core';
import { DGTMockDataService } from './metadata/services/dgt-mock-data.service';
import { DGTQueryService } from './metadata/services/dgt-query.service';
import { DGTSourceService } from './source/services/dgt-source.service';
import { DGTWorkflowService } from './workflow/services/dgt-workflow.service';
import { DGTSharedUtilsModule } from '@digita/dgt-shared-utils';
import { DGTCacheService } from './cache/services/dgt-cache.service';
import { DGTLDFilterRunnerBGPService } from './linked-data/services/dgt-ld-filter-runner-bgp.service';
import { DGTLDFilterService } from './linked-data/services/dgt-ld-filter.service';
import { DGTLDFilterRunnerSparqlService } from './linked-data/services/dgt-ld-filter-runner-sparql.service';
import { DGTLDTripleFactoryService } from './linked-data/services/dgt-ld-triple-factory.service';
import { DGTDataInterfaceHostDirective } from './data-value/directives/data-interface-host.directive';
import { DGTHolderService } from './holder/services/dgt-holder.service';
import { DGTConnectionsService } from './connection/services/dgt-connections.service';
import { DGTLDService } from './linked-data/services/dgt-ld.service';

export const declarations = [
  DGTDataInterfaceHostDirective
];
export const imports = [
  DGTSharedUtilsModule
];
export const providers = [
  DGTLDService,
  DGTLDFilterService,
  DGTLDFilterRunnerBGPService,
  DGTLDFilterRunnerSparqlService,
  DGTQueryService,
  DGTMockDataService,
  DGTSourceService,
  DGTCacheService,
  DGTHolderService,
  DGTWorkflowService,
  DGTLDTripleFactoryService,
  DGTConnectionsService
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
