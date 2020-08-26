import { Injectable } from '@angular/core';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable, forkJoin } from 'rxjs';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTErrorArgument, DGTMap, DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTLDFilterRunnerSparqlService } from './dgt-ld-filter-runner-sparql.service';
import { DGTLDFilterRunnerBGPService } from './dgt-ld-filter-runner-bgp.service';
import { DGTLDTripleFactoryService } from '../../linked-data/services/dgt-ld-triple-factory.service';
import { DGTLDFilterFilterType } from '../models/dgt-ld-filter-filtertype.model';
import { DGTLDFilterRunnerHolderService } from './dgt-ld-filter-runner-holder.service';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTLDFilterRunnerExchangeService } from './dgt-ld-filter-runner-exchange.service';

@Injectable()
export class DGTLDFilterService {

  private runners: DGTMap<DGTLDFilterType, DGTLDFilterRunnerService<DGTLDFilter>> = new DGTMap<DGTLDFilterType, DGTLDFilterRunnerService<DGTLDFilter>>();

  constructor(
    private logger: DGTLoggerService,
    triples: DGTLDTripleFactoryService,
    private paramChecker: DGTParameterCheckerService,
    connections: DGTConnectionService,
  ) {
    this.register(new DGTLDFilterRunnerBGPService());
    this.register(new DGTLDFilterRunnerSparqlService(logger, triples));
    this.register(new DGTLDFilterRunnerHolderService(connections, paramChecker));
    this.register(new DGTLDFilterRunnerExchangeService(paramChecker));
  }

  public register<T extends DGTLDFilter>(runner: DGTLDFilterRunnerService<T>) {
    this.paramChecker.checkParametersNotNull({runner});
    this.runners.set(runner.type, runner);
  }

  public run(filters: DGTLDFilter[], triples: DGTLDTriple[], type?: DGTLDFilterFilterType): Observable<DGTLDTriple[]> {
    this.logger.debug(DGTLDFilterService.name, 'Starting to run filters', { filters, triples });
    this.paramChecker.checkParametersNotNull({filters, triples});

    const filteredTriples = triples;
    const ranAllFilters = filters.map(filter => this.runOne(filter, filteredTriples));

    if ( !type || type === DGTLDFilterFilterType.OR ) {
      return forkJoin(ranAllFilters).pipe(
        map(res => _.flatten(res)),
        map(res => _.uniq(res)),
      );
    } else if ( type === DGTLDFilterFilterType.AND ) {
      return forkJoin(ranAllFilters).pipe(
        map(res => _.intersection(...res)),
        map(res => _.uniq(res)),
      );
    }
  }

  private runOne(filter: DGTLDFilter, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    this.paramChecker.checkParametersNotNull({filter, triples});
    const runner = this.runners.get(filter.type);

    if (!runner) {
      throw new DGTErrorArgument('No runner register for the given filter type.', runner);
    }

    return runner.run(filter, triples);
  }
}
