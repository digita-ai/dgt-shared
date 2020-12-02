
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { DGTLDFilterCombination } from '../models/dgt-ld-filter-combination.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTParameterCheckerService, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { Observable, forkJoin } from 'rxjs';
import { DGTLDFilterByCombinationType } from '../models/dgt-ld-filter-combination-type.model';
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

  run<R extends DGTLDResource>(filter: DGTLDFilterCombination, resources: R[]): Observable<R[]> {
    this.paramChecker.checkParametersNotNull({ filter, resources });

    return forkJoin(filter.filters.map(subFilter => this.filterService.run(subFilter, resources)))
      .pipe(
        map(filteredResources => filter.combinationType === DGTLDFilterByCombinationType.AND ? _.uniq(_.intersection(...filteredResources)) : _.uniq(_.flatten(filteredResources))),
      );

    // if (filter.combinationType === DGTLDFilterByCombinationType.AND) {
    //   return forkJoin(res).pipe(
    //     map(filteredResources => _.uniq(_.intersection(...filteredResources)))
    //   );
    // } else if (filter.combinationType === DGTLDFilterByCombinationType.OR) {
    //   return forkJoin(res).pipe(
    //     map(filteredResources => _.uniq(_.flatten(filteredResources)))
    //   );
    // } else {
    //   throw new DGTErrorArgument('CombinationType not supported', filter.combinationType);
    // }
  }
}
