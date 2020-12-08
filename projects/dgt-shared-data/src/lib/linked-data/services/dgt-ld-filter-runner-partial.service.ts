import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { Observable, of } from 'rxjs';
import { DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import * as _ from 'lodash';
import { DGTLDFilterPartial } from '../models/dgt-ld-filter-partial.model';

@DGTInjectable()
export class DGTLDFilterRunnerPartialService implements DGTLDFilterRunnerService<DGTLDFilterPartial> {
  public readonly type: DGTLDFilterType = DGTLDFilterType.PARTIAL;

  constructor(private paramChecker: DGTParameterCheckerService) { }

  run<R extends DGTLDResource>(filter: DGTLDFilterPartial, resources: R[]): Observable<R[]> {
    this.paramChecker.checkParametersNotNull({ filter, resources });
    return of(_.filter(resources, filter.partial));
  }
}
