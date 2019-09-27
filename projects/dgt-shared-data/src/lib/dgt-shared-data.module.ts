import { NgModule } from '@angular/core';
import { DGTMockDataService } from './metadata/services/dgt-mock-data.service';
import { DGTSubjectService } from './subject/services/dgt-subject.service';
import { DGTLDService } from './linked-data/services/dgt-ld.service';
import { DGTLDMappingService } from './linked-data/services/dgt-ld-mapping.service';
import { DGTQueryService } from './metadata/services/dgt-query.service';
import { DGTSourceService } from './source/services/dgt-source.service';

@NgModule({
  declarations: [

  ],
  providers: [
    DGTQueryService,
    DGTMockDataService,
    DGTLDService,
    DGTLDMappingService,
    DGTSourceService,
    DGTSubjectService
  ],
  imports: [

  ],
  exports: [

  ]
})
export class DGTSharedDataModule { }
