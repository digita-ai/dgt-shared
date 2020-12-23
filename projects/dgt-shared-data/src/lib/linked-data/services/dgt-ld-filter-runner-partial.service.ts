import { DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { DGTLDFilterPartial } from '../models/dgt-ld-filter-partial.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';

@DGTInjectable()
export class DGTLDFilterRunnerPartialService implements DGTLDFilterRunnerService<DGTLDFilterPartial> {
  public readonly type: DGTLDFilterType = DGTLDFilterType.PARTIAL;

  constructor(private paramChecker: DGTParameterCheckerService) { }

  run<R extends DGTLDResource>(filter: DGTLDFilterPartial, resources: R[]): Observable<R[]> {
    this.paramChecker.checkParametersNotNull({ filter, resources });
    return of(_.filter(resources, filter.partial));
  }
}
