import { NgModule } from '@angular/core';
import { DGTMockDataService } from './metadata/services/dgt-mock-data.service';
import { DGTQueryService } from './metadata/services/dgt-query.service';
import { DGTSourceService } from './source/services/dgt-source.service';
import { DGTWorkflowService } from './workflow/services/dgt-workflow.service';
import { DGTSharedUtilsModule } from '@digita/dgt-shared-utils';
import { DGTCacheService } from './cache/services/dgt-cache.service';
import { DGTCategoryFilterRunnerBGPService } from './categories/services/dgt-category-filter-runner-bgp.service';
import { DGTCategoryFilterService } from './categories/services/dgt-category-filter.service';
import { DGTCategoryFilterRunnerSparqlService } from './categories/services/dgt-category-filter-runner-sparql.service';
import { DGTLDTripleFactoryService } from './linked-data/services/dgt-ld-triple-factory.service';
import { DGTHolderService } from './holder/services/dgt-holder.service';

export const declarations = [];
export const imports = [
  DGTSharedUtilsModule
];
export const providers = [
  DGTCategoryFilterService,
  DGTCategoryFilterRunnerBGPService,
  DGTCategoryFilterRunnerSparqlService,
  DGTQueryService,
  DGTMockDataService,
  DGTSourceService,
  DGTCacheService,
  DGTHolderService,
  DGTWorkflowService,
  DGTLDTripleFactoryService
];

@NgModule({
  declarations,
  providers,
  imports,
  exports: [

  ]
})
export class DGTSharedDataModule { }
