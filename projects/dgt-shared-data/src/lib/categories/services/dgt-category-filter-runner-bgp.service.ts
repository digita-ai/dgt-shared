import { DGTCategoryFilterBGP } from '../models/dgt-category-filter-bgp.model';
import { DGTCategoryFilterRunnerService } from './dgt-category-filter-runner.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable, of } from 'rxjs';
import { DGTErrorArgument } from '@digita/dgt-shared-utils';
import { DGTCategoryFilterType } from '../models/dgt-category-filter-type.model';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTCategoryFilterRunnerBGPService implements DGTCategoryFilterRunnerService<DGTCategoryFilterBGP> {
    public readonly type: DGTCategoryFilterType = DGTCategoryFilterType.BGP;
    
    run(filter: DGTCategoryFilterBGP, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }

        return of(triples.filter(triple => this.runOne(filter, triple)));
    }

    private runOne(filter: DGTCategoryFilterBGP, triple: DGTLDTriple): boolean {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!triple) {
            throw new DGTErrorArgument('Argument triple should be set.', triple);
        }

        const match = filter.predicates.find(
            predicate =>
                predicate.namespace === triple.predicate.namespace
                && predicate.name === triple.predicate.name
        )

        return match ? true : false;
    }
}