import { Injectable } from '@angular/core';
import { DGTLDFilter } from '../models/dgt-ld-filter.model';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable, forkJoin } from 'rxjs';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTErrorArgument, DGTMap, DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { DGTLDFilterRunnerSparqlService } from './dgt-ld-filter-runner-sparql.service';
import { DGTLDFilterRunnerBGPService } from './dgt-ld-filter-runner-bgp.service';
import { DGTLDTripleFactoryService } from '../../linked-data/services/dgt-ld-triple-factory.service';

@Injectable()
export class DGTLDFilterService {

    private runners: DGTMap<DGTLDFilterType, DGTLDFilterRunnerService<DGTLDFilter>> = new DGTMap<DGTLDFilterType, DGTLDFilterRunnerService<DGTLDFilter>>();

    constructor(private logger: DGTLoggerService, triples: DGTLDTripleFactoryService) {
        this.register(new DGTLDFilterRunnerBGPService());
        this.register(new DGTLDFilterRunnerSparqlService(logger, triples));
    }

    public register<T extends DGTLDFilter>(runner: DGTLDFilterRunnerService<T>) {
        if (!runner) {
            throw new DGTErrorArgument('Argument runner should be set.', runner);
        }

        this.runners.set(runner.type, runner);
    }

    public run(filters: DGTLDFilter[], triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        this.logger.debug(DGTLDFilterService.name, 'Starting to run filters', { filters, triples });

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
