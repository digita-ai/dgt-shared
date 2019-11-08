import { NgModule } from '@angular/core';
import { DGTMockDataService } from './metadata/services/dgt-mock-data.service';
import { DGTSubjectService } from './subject/services/dgt-subject.service';
import { DGTLDMappingService } from './linked-data/services/dgt-ld-mapping.service';
import { DGTQueryService } from './metadata/services/dgt-query.service';
import { DGTSourceService } from './source/services/dgt-source.service';
import { DGTWorkflowService } from './workflow/services/dgt-workflow.service';

@NgModule({
  declarations: [

  ],
  providers: [
    DGTQueryService,
    DGTMockDataService,
    DGTLDMappingService,
    DGTSourceService,
    DGTSubjectService,
    DGTWorkflowService
  ],
  imports: [

  ],
  exports: [

  ]
})
export class DGTSharedDataModule { }
