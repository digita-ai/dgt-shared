import { DGTLDFilterBGP } from '../models/dgt-ld-filter-bgp.model';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { DGTLDTriple } from '../../linked-data/models/dgt-ld-triple.model';
import { Observable, of } from 'rxjs';
import { DGTErrorArgument } from '@digita/dgt-shared-utils';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { Injectable } from '@angular/core';

@Injectable()
export class DGTLDFilterRunnerBGPService implements DGTLDFilterRunnerService<DGTLDFilterBGP> {
    public readonly type: DGTLDFilterType = DGTLDFilterType.BGP;

    run(filter: DGTLDFilterBGP, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }

        return of(triples.filter(triple => this.runOne(filter, triple)));
    }

    private runOne(filter: DGTLDFilterBGP, triple: DGTLDTriple): boolean {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!triple) {
            throw new DGTErrorArgument('Argument triple should be set.', triple);
        }

        const match = filter.predicates.find(
            predicate => predicate === triple.predicate
        );

        return match ? true : false;
    }
}
