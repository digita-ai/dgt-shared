import { NgModule } from '@angular/core';
import { DGTMockDataService } from './metadata/services/dgt-mock-data.service';
import { DGTSubjectService } from './subject/services/dgt-subject.service';
import { DGTLDMappingService } from './linked-data/services/dgt-ld-mapping.service';
import { DGTQueryService } from './metadata/services/dgt-query.service';
import { DGTSourceService } from './source/services/dgt-source.service';
import { DGTWorkflowService } from './workflow/services/dgt-workflow.service';
import { DGTSharedUtilsModule } from '@digita/dgt-shared-utils';
import { DGTCacheService } from './cache/services/dgt-cache.service';

export const declarations = [];
export const imports = [
  DGTSharedUtilsModule
];
export const providers = [
  DGTQueryService,
  DGTMockDataService,
  DGTLDMappingService,
  DGTSourceService,
  DGTCacheService,
  DGTSubjectService,
  DGTWorkflowService
];

@NgModule({
  declarations,
  providers,
  imports,
  exports: [

  ]
})
export class DGTSharedDataModule { }
