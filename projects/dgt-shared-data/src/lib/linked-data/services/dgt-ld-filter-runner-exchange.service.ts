import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { Observable, of } from 'rxjs';
import { DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';

import { DGTLDFilterExchange } from '../models/dgt-ld-filter-exchange.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';

@DGTInjectable()
export class DGTLDFilterRunnerExchangeService implements DGTLDFilterRunnerService<DGTLDFilterExchange> {
  public readonly type: DGTLDFilterType = DGTLDFilterType.EXCHANGE;

  constructor(private paramChecker: DGTParameterCheckerService) { }

  run<R extends DGTLDResource>(filter: DGTLDFilterExchange, resources: R[]): Observable<R[]> {
    this.paramChecker.checkParametersNotNull({ filter, resources });
    return of(resources.filter(triple => this.runOne(filter, triple)));
  }

  private runOne(filter: DGTLDFilterExchange, resource: DGTLDResource): boolean {
    this.paramChecker.checkParametersNotNull({ filter, resource });
    const match = filter.exchanges.find(
      exchange => exchange.uri === resource.exchange
    );
    return match ? true : false;
  }
}
