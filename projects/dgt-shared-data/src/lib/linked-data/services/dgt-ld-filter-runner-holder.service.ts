import { Injectable } from '@angular/core';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDFilterHolder } from '../models/dgt-ld-filter-holder.model';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { Observable, of } from 'rxjs';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTErrorArgument } from '@digita/dgt-shared-utils/digita-dgt-shared-utils';

@Injectable()
export class DGTLDFilterHolderService implements DGTLDFilterRunnerService<DGTLDFilterHolder> {
    public readonly type: DGTLDFilterType = DGTLDFilterType.HOLDER;

    public run(filter: DGTLDFilterHolder, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }

        return of(triples.filter(triple => this.runOne(filter, triple)));
    }

    private runOne(filter: DGTLDFilterHolder, triple: DGTLDTriple): boolean {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!triple) {
            throw new DGTErrorArgument('Argument triple should be set.', triple);
        }

        const match = filter.holders.find(
            holder =>  true
        );

        throw Error('Not implemented');

        return match ? true : false;
    }

}