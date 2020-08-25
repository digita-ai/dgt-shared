import { Injectable, Type } from '@angular/core';
import { DGTLDFilter } from '../models/dgt-category-filter.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable, concat, forkJoin } from 'rxjs';
import { DGTCategoryFilterType } from '../models/dgt-category-filter-type.model';
import { DGTErrorArgument, DGTMap, DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTCategoryFilterRunnerService } from './dgt-category-filter-runner.service';
import { tap, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTCategoryFilterRunnerSparqlService } from './dgt-category-filter-runner-sparql.service';
import { DGTCategoryFilterRunnerBGPService } from './dgt-category-filter-runner-bgp.service';
import { DGTLDTripleFactoryService } from '../../linked-data/services/dgt-ld-triple-factory.service';

@Injectable()
export class DGTCategoryFilterService {

    private runners: DGTMap<DGTCategoryFilterType, DGTCategoryFilterRunnerService<DGTLDFilter>> = new DGTMap<DGTCategoryFilterType, DGTCategoryFilterRunnerService<DGTLDFilter>>();

    constructor(private logger: DGTLoggerService, triples: DGTLDTripleFactoryService) {
        this.register(new DGTCategoryFilterRunnerBGPService());
        this.register(new DGTCategoryFilterRunnerSparqlService(logger, triples));
    }

    public register<T extends DGTLDFilter>(runner: DGTCategoryFilterRunnerService<T>) {
        if (!runner) {
            throw new DGTErrorArgument('Argument runner should be set.', runner);
        }

        this.runners.set(runner.type, runner);
    }

    public run(filters: DGTLDFilter[], triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTCategoryFilterService.name, 'Starting to run filters', { filters, triples });

        if (!filters) {
            throw new DGTErrorArgument('Argument filters should be set.', filters);
        }

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }

        let filteredTriples = triples;

        const runAllFilters = filters.map(filter => this.runOne(filter, filteredTriples)
            .pipe(
                // tap(newlyFilteredTriples => filteredTriples = newlyFilteredTriples)
            )
        )

        return forkJoin(runAllFilters)
            .pipe(
                map(listOfTriples => _.flatten(listOfTriples)),
                map(triples => _.uniq(triples)),
            );
    }

    private runOne(filter: DGTLDFilter, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }

        const runner = this.runners.get(filter.type);

        if (!runner) {
            throw new DGTErrorArgument('No runner register for the given filter type.', runner);
        }

        return runner.run(filter, triples);
    }
}
