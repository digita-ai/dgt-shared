
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDFilterHolder } from '../models/dgt-ld-filter-holder.model';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { Observable, of, forkJoin } from 'rxjs';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTErrorArgument, DGTInjectable, DGTParameterCheckerService } from '@digita/dgt-shared-utils';
import { DGTConnectionService } from '../../connection/services/dgt-connection-abstract.service';
import { map, tap } from 'rxjs/operators';

@DGTInjectable()
export class DGTLDFilterRunnerHolderService implements DGTLDFilterRunnerService<DGTLDFilterHolder> {
    public readonly type: DGTLDFilterType = DGTLDFilterType.HOLDER;

    constructor(
        private connections: DGTConnectionService,
        private paramChecker: DGTParameterCheckerService,
    ) { }

    public run(filter: DGTLDFilterHolder, triples: DGTLDTriple[]): Observable<DGTLDTriple[]> {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!triples) {
            throw new DGTErrorArgument('Argument triples should be set.', triples);
        }
        // This might not work
        return forkJoin(triples.map(triple => this.runOne(filter, triple).pipe(map(result => result ? triple : null))))
        .pipe(
            map(triples => triples.filter(triple => triple !== null)),
        )

        // return triples.filter(triple => this.runOne(filter, triple));
    }

    private runOne(filter: DGTLDFilterHolder, triple: DGTLDTriple): Observable<boolean> {
        this.paramChecker.checkParametersNotNull({ filter, triple });
        return this.connections.get(triple.connection).pipe(
            map(connection => filter.holders.find(holder => holder.id === connection.holder)),
            map(holder => holder !== null && holder !== undefined ? true : false)
        );
    }

}