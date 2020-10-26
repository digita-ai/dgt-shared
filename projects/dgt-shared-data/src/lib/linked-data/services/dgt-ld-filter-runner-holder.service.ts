
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDFilterHolder } from '../models/dgt-ld-filter-holder.model';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';
import { Observable, of, forkJoin } from 'rxjs';
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { map, switchMap } from 'rxjs/operators';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';

@DGTInjectable()
export class DGTLDFilterRunnerHolderService implements DGTLDFilterRunnerService<DGTLDFilterHolder> {
    public readonly type: DGTLDFilterType = DGTLDFilterType.HOLDER;

    constructor(
        private exchanges: DGTExchangeService,
        private paramChecker: DGTParameterCheckerService,
    ) { }

    public run(filter: DGTLDFilterHolder, resources: DGTLDResource[]): Observable<DGTLDResource[]> {
        if (!filter) {
            throw new DGTErrorArgument('Argument filter should be set.', filter);
        }

        if (!resources) {
            throw new DGTErrorArgument('Argument triples should be set.', resources);
        }
        // This might not work
        return of({filter, resources})
        .pipe(
            switchMap(data => forkJoin(resources.map(triple => this.runOne(filter, triple).pipe(map(result => result ? triple : null))))),
            map(triples => triples.filter(triple => triple !== null)),
        )
    }

    private runOne(filter: DGTLDFilterHolder, resource: DGTLDResource): Observable<boolean> {
        this.paramChecker.checkParametersNotNull({ filter, resource });
        return this.exchanges.get(resource.exchange).pipe(
            map(exchange => exchange && exchange.holder ? filter.holders.find(holder => holder.id === exchange.holder) : null),
            map(holder => holder !== null && holder !== undefined ? true : false)
        );
    }

}