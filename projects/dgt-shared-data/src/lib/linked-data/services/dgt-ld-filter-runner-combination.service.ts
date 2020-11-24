
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { DGTLDFilterCombination } from '../models/dgt-ld-filter-combination.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTParameterCheckerService, DGTErrorArgument, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable, forkJoin } from 'rxjs';
import { DGTLDFilterByCombinationType } from '../models/dgt-ld-filter-combination-type.model';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDFilterService } from './dgt-ld-filter.service';
import { DGTLDResource } from '../models/dgt-ld-resource.model';

@DGTInjectable()
export class DGTLDFilterRunnerCombinationService implements DGTLDFilterRunnerService<DGTLDFilterCombination> {
  public readonly type: DGTLDFilterType = DGTLDFilterType.COMBINATION;

  constructor(
    private paramChecker: DGTParameterCheckerService,
    private filterService: DGTLDFilterService,
  ) { }

  run(filter: DGTLDFilterCombination, resources: DGTLDResource[]): Observable<DGTLDResource[]> {
    this.paramChecker.checkParametersNotNull({ filter, resources });
    const res: Observable<DGTLDResource[]>[] =
      filter.filters.map(subFilter => this.runOne(subFilter, resources));

    if (filter.combinationType === DGTLDFilterByCombinationType.AND) {
      return forkJoin(res).pipe(
        map(filteredTriples => _.uniq(_.intersection(...filteredTriples)))
      );
    } else if (filter.combinationType === DGTLDFilterByCombinationType.OR) {
      return forkJoin(res).pipe(
        map(filteredTriples => _.uniq(_.flatten(filteredTriples)))
      );
    } else {
      throw new DGTErrorArgument('CombinationType not supported', filter.combinationType);
    }
  }

  private runOne(filter: DGTLDFilter, resources: DGTLDResource[]): Observable<DGTLDResource[]> {
    this.paramChecker.checkParametersNotNull({ filter, resources });
    return this.filterService.run(filter, resources);
  }
}
