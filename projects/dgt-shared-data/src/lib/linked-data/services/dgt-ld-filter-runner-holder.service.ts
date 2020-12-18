
import { DGTErrorArgument, DGTErrorNotImplemented, DGTInjectable, DGTParameterCheckerService } from '@digita-ai/dgt-shared-utils';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DGTExchangeService } from '../../exchanges/services/dgt-exchange.service';
import { DGTLDFilterHolder } from '../models/dgt-ld-filter-holder.model';
import { DGTLDFilterType } from '../models/dgt-ld-filter-type.model';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDFilterRunnerService } from './dgt-ld-filter-runner.service';

@DGTInjectable()
export class DGTLDFilterRunnerHolderService implements DGTLDFilterRunnerService<DGTLDFilterHolder> {
    public readonly type: DGTLDFilterType = DGTLDFilterType.HOLDER;

    constructor(
        private exchanges: DGTExchangeService,
        private paramChecker: DGTParameterCheckerService,
    ) { }

    public run<R extends DGTLDResource>(filter: DGTLDFilterHolder, resources: R[]): Observable<R[]> {
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
            map(exchange => exchange && exchange.holder ? filter.holders.find(holder => holder.uri === exchange.holder) : null),
            map(holder => holder !== null && holder !== undefined ? true : false),
        );
    }

}
