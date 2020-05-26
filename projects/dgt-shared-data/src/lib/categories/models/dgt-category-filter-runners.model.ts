import { DGTCategoryFilterRunnerService } from '../services/dgt-category-filter-runner.service';
import { Type } from '@angular/core';
import { DGTCategoryFilter } from './dgt-category-filter.model';

export interface DGTCategoryFilterRunners {
    runners: Type<DGTCategoryFilterRunnerService<DGTCategoryFilter>>[];
}
