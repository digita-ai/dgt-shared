import { Injectable } from '@angular/core';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { DGTLDFilterCombination } from '../models/dgt-ld-filter-combination.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTParameterCheckerService, DGTErrorArgument } from '@digita/dgt-shared-utils';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { Observable, forkJoin } from 'rxjs';
import { DGTLDFilterByCombinationType } from '../models/dgt-ld-filter-combination-type.model';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DGTLDFilterService } from './dgt-ld-filter.service';

@Injectable()
export class DGTLDFilterRunnerCombinationService implements DGTLDFilterRunnerService<DGTLDFilterCombination> {
  public readonly type: DGTLDFilterType = DGTLDFilterType.COMBINATION;

  constructor(
    private paramChecker: DGTParameterCheckerService,
    private filterService: DGTLDFilterService
  ) { }

  run(filter: DGTLDFilterCombination, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    this.paramChecker.checkParametersNotNull({ filter, triples });
    const res: Observable<DGTLDTriple[]>[] = 
    filter.filters.map( subFilter => this.runOne(subFilter, triples));

    if ( filter.combinationType === DGTLDFilterByCombinationType.AND ) {
      return forkJoin(res).pipe(
        map( filteredTriples => _.uniq(_.intersection(...filteredTriples)))
      );
    } else if ( filter.combinationType === DGTLDFilterByCombinationType.OR ) {
      return forkJoin(res).pipe(
        map( filteredTriples => _.uniq(_.flatten(filteredTriples)))
      );
    } else {
      throw new DGTErrorArgument('CombinationType not supported', filter.combinationType);
    }
  }

  private runOne(filter: DGTLDFilter, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    this.paramChecker.checkParametersNotNull({ filter, triples });
    return this.filterService.run(filter, triples);
  }
}
