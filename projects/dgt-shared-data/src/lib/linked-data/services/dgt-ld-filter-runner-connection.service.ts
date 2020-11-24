import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { forkJoin, Observable, of } from 'rxjs';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';

import { DGTLDFilterConnection } from '../models/dgt-ld-filter-connection.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { map, switchMap } from 'rxjs/operators';

@DGTInjectable()
export class DGTLDFilterRunnerConnectionService implements DGTLDFilterRunnerService<DGTLDFilterConnection> {
  public readonly type: DGTLDFilterType = DGTLDFilterType.CONNECTION;

  constructor(private exchanges: DGTExchangeService, private paramChecker: DGTParameterCheckerService) { }

  run(filter: DGTLDFilterConnection, resources: DGTLDResource[]): Observable<DGTLDResource[]> {
    if (!filter) {
      throw new DGTErrorArgument('Argument filter should be set.', filter);
  }

  if (!resources) {
      throw new DGTErrorArgument('Argument triples should be set.', resources);
  }
  
  return of({filter, resources})
  .pipe(
      switchMap(data => forkJoin(resources.map(triple => this.runOne(filter, triple).pipe(map(result => result ? triple : null))))),
      map(triples => triples.filter(triple => triple !== null)),
  )
}

private runOne(filter: DGTLDFilterConnection, resource: DGTLDResource): Observable<boolean> {
  this.paramChecker.checkParametersNotNull({ filter, resource });
  return this.exchanges.get(resource.exchange).pipe(
      map(exchange => exchange && exchange.connection ? filter.connections.find(connection => connection.uri === exchange.connection) : null),
      map(holder => holder !== null && holder !== undefined ? true : false)
  );
}
}
