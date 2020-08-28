import { Injectable } from '@angular/core';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable } from 'rxjs';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTErrorArgument, DGTMap, DGTLoggerService, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import * as _ from 'lodash';
import { DGTLDFilterRunnerSparqlService } from './dgt-ld-filter-runner-sparql.service';
import { DGTLDFilterRunnerBGPService } from './dgt-ld-filter-runner-bgp.service';
import { DGTLDTripleFactoryService } from '../../linked-data/services/dgt-ld-triple-factory.service';
import { DGTLDFilterRunnerHolderService } from './dgt-ld-filter-runner-holder.service';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { DGTLDFilterRunnerExchangeService } from './dgt-ld-filter-runner-exchange.service';
import { DGTLDFilterRunnerConnectionService } from './dgt-ld-filter-runner-connection.service';
import { DGTLDFilterRunnerCombinationService } from './dgt-ld-filter-runner-combination.service';

@Injectable()
export class DGTLDFilterService {

  private runners: DGTMap<DGTLDFilterType, DGTLDFilterRunnerService<DGTLDFilter>> = new DGTMap<DGTLDFilterType, DGTLDFilterRunnerService<DGTLDFilter>>();

  constructor(
    private logger: DGTLoggerService,
    private triples: DGTLDTripleFactoryService,
    private paramChecker: DGTParameterCheckerService,
    private connections: DGTConnectionService,
  ) {
    this.register(new DGTLDFilterRunnerBGPService());
    this.register(new DGTLDFilterRunnerSparqlService(logger, this.triples));
    this.register(new DGTLDFilterRunnerHolderService(this.connections, paramChecker));
    this.register(new DGTLDFilterRunnerExchangeService(paramChecker));
    this.register(new DGTLDFilterRunnerConnectionService(paramChecker));
    this.register(new DGTLDFilterRunnerCombinationService(paramChecker, this));
  }

  public register<T extends DGTLDFilter>(runner: DGTLDFilterRunnerService<T>) {
    this.paramChecker.checkParametersNotNull({runner});
    this.runners.set(runner.type, runner);
  }

  public run(filter: DGTLDFilter, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
    this.logger.debug(DGTLDFilterService.name, 'Starting to run filters', { filter, triples });
    this.paramChecker.checkParametersNotNull({filter, triples});
    const runner = this.runners.get(filter.type);
    if (!runner) {
      throw new DGTErrorArgument('No runner registered for the given filter type.', runner);
    }
    return runner.run(filter, triples);
  }
}
