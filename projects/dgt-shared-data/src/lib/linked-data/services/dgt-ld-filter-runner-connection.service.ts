import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable, of } from 'rxjs';
import { DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { Injectable } from '@angular/core';
import { DGTLDFilterConnection } from '../models/dgt-ld-filter-connection.model';

@Injectable()
export class DGTLDFilterRunnerConnectionService implements DGTLDFilterRunnerService<DGTLDFilterConnection> {
  public readonly type: DGTLDFilterType = DGTLDFilterType.CONNECTION;

  constructor(private paramChecker: DGTParameterCheckerService) { }

  run(filter: DGTLDFilterConnection, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    this.paramChecker.checkParametersNotNull({ filter, triples });
    return of(triples.filter(triple => this.runOne(filter, triple)));
  }

  private runOne(filter: DGTLDFilterConnection, triple: DGTLDTriple): boolean {
    this.paramChecker.checkParametersNotNull({ filter, triple });

    const match = filter.connections.find(
      connection => connection.id === triple.connection
    );

    return match ? true : false;
  }
}
