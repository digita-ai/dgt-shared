import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable, of } from 'rxjs';
import { DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { Injectable } from '@angular/core';
import { DGTLDFilterExchange } from '../models/dgt-ld-filter-exchange.model';

@Injectable()
export class DGTLDFilterRunnerExchangeService implements DGTLDFilterRunnerService<DGTLDFilterExchange> {
  public readonly type: DGTLDFilterType = DGTLDFilterType.EXCHANGE;

  constructor(private paramChecker: DGTParameterCheckerService) { }

  run(filter: DGTLDFilterExchange, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    this.paramChecker.checkParametersNotNull({ filter, triples });
    return of(triples.filter(triple => this.runOne(filter, triple)));
  }

  private runOne(filter: DGTLDFilterExchange, triple: DGTLDTriple): boolean {
    this.paramChecker.checkParametersNotNull({ filter, triple });
    const match = filter.exchanges.find(
      exchange => exchange.id === triple.exchange
    );
    return match ? true : false;
  }
}
