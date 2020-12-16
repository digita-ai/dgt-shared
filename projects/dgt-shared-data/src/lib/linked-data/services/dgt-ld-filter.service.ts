
import { DGTErrorArgument, DGTInjectable, DGTLoggerService, DGTMap, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDFilterRunnerBGPService } from './dgt-ld-filter-runner-bgp.service';
import { DGTLDFilterRunnerCombinationService } from './dgt-ld-filter-runner-combination.service';
import { DGTLDFilterRunnerExchangeService } from './dgt-ld-filter-runner-exchange.service';
import { DGTLDFilterRunnerPartialService } from './dgt-ld-filter-runner-partial.service';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { DGTLDFilterSparqlExchangeService } from './dgt-ld-filter-sparql-exchange.service';
import { DGTLDFilterSparqlPartialService } from './dgt-ld-filter-sparql-partial.service';
import { DGTLDFilterSparqlService } from './dgt-ld-filter-sparql-service';

/**
 * This service handles DGTLDFilters and their DGTLDFilterRunnerServices / DGTLDFilterSparqlService
 */
@DGTInjectable()
export class DGTLDFilterService {

  /** Map of runnerServices => <type, service> */
  private runnerServices: DGTMap<DGTLDFilterType, DGTLDFilterRunnerService<DGTLDFilter>> = new DGTMap<DGTLDFilterType, DGTLDFilterRunnerService<DGTLDFilter>>();

  /** Map of sparqlServices => <type, service> */
  private sparqlServices: DGTMap<DGTLDFilterType, DGTLDFilterSparqlService<DGTLDFilter>> = new DGTMap<DGTLDFilterType, DGTLDFilterSparqlService<DGTLDFilter>>();

  constructor(
    private logger: DGTLoggerService,
    private paramChecker: DGTParameterCheckerService,
  ) {
    // runner services
    this.registerRunnerService(new DGTLDFilterRunnerBGPService());
    this.registerRunnerService(new DGTLDFilterRunnerExchangeService(this.paramChecker));
    this.registerRunnerService(new DGTLDFilterRunnerPartialService(this.paramChecker));
    this.registerRunnerService(new DGTLDFilterRunnerCombinationService(this.paramChecker, this));

    // sparql services
    this.registerSparqlService(new DGTLDFilterSparqlExchangeService(this.paramChecker));
    this.registerSparqlService(new DGTLDFilterSparqlPartialService(this.paramChecker));
  }

  /**
   * Registers DGTLDFilterSparqlServices to this service
   * @param runnerService The DGTLDFilterSparqlService to register
   */
  public registerRunnerService<T extends DGTLDFilter>(runnerService: DGTLDFilterRunnerService<T>) {
    this.paramChecker.checkParametersNotNull({ runnerService });
    this.runnerServices.set(runnerService.type, runnerService);
  }

  /**
   * Registers DGTLDFilterSparqlServices to this service
   * @param sparqlService The DGTLDFilterSparqlService to register
   */
  public registerSparqlService<T extends DGTLDFilter>(sparqlService: DGTLDFilterSparqlService<T>) {
    this.paramChecker.checkParametersNotNull({ sparqlService });
    this.sparqlServices.set(sparqlService.type, sparqlService);
  }

  /**
   * Runs resources through a filter
   * @param filter The DGTLDFilter to run
   * @param resources The resources to be filtered
   */
  public run<T extends DGTLDResource>(filter: DGTLDFilter, resources: T[]): Observable<T[]> {
    this.logger.debug(DGTLDFilterService.name, 'Running filter', { filter });

    this.paramChecker.checkParametersNotNull({ filter, resources });
    const runner = this.runnerServices.get(filter.type);
    if (!runner) {
      throw new DGTErrorArgument('No runner registered for the given filter type.', { filter, runner });
    }
    return runner.run(filter, resources);
  }

  /**
   * Creates a SparQL query from a filter
   * @param filter The DGTLDFilter to create the query from
   */
  public getQuery(filter: DGTLDFilter): Observable<string> {
    this.logger.debug(DGTLDFilterService.name, 'Creating query', { filter });

    this.paramChecker.checkParametersNotNull({filter});
    const sparqlService = this.sparqlServices.get(filter.type);
    if (!sparqlService) {
      throw new DGTErrorArgument('No runner registered for the given filter type.', { filter, sparqlService });
    }
    return sparqlService.getQuery(filter);
  }
}
